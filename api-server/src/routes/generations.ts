import { Router, type IRouter } from "express";
import { eq, desc, like, and, inArray, gte, sql } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
import { db, generationsTable, collectionItemsTable } from "@workspace/db";
import {
  CreateGenerationBody,
  UpdateGenerationBody,
  UpdateGenerationParams,
  GetGenerationParams,
  DeleteGenerationParams,
  ListGenerationsQueryParams,
  ListRecentGenerationsQueryParams,
  CreateVariationParams,
  CreateVariationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getCollectionIdsForGeneration(generationId: number): Promise<number[]> {
  const items = await db
    .select({ collectionId: collectionItemsTable.collectionId })
    .from(collectionItemsTable)
    .where(eq(collectionItemsTable.generationId, generationId));
  return items.map((i) => i.collectionId);
}

async function formatGeneration(gen: typeof generationsTable.$inferSelect) {
  const collectionIds = await getCollectionIdsForGeneration(gen.id);
  return {
    ...gen,
    collectionIds,
  };
}

router.get("/generations", async (req, res): Promise<void> => {
  const parsed = ListGenerationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { type, collectionId, search, limit, offset } = parsed.data;

  let query = db.select().from(generationsTable).$dynamic();

  const conditions = [];
  if (type) conditions.push(eq(generationsTable.type, type));
  if (search) conditions.push(like(generationsTable.prompt, `%${search}%`));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  let rows = await query.orderBy(desc(generationsTable.createdAt)).limit(limit ?? 50).offset(offset ?? 0);

  if (collectionId != null) {
    const items = await db
      .select({ generationId: collectionItemsTable.generationId })
      .from(collectionItemsTable)
      .where(eq(collectionItemsTable.collectionId, collectionId));
    const ids = items.map((i) => i.generationId);
    if (ids.length === 0) {
      res.json([]);
      return;
    }
    rows = rows.filter((r) => ids.includes(r.id));
  }

  const formatted = await Promise.all(rows.map(formatGeneration));
  res.json(formatted);
});

router.get("/generations/recent", async (req, res): Promise<void> => {
  const parsed = ListRecentGenerationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit } = parsed.data;

  const rows = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.status, "completed"))
    .orderBy(desc(generationsTable.createdAt))
    .limit(limit ?? 12);

  const formatted = await Promise.all(rows.map(formatGeneration));
  res.json(formatted);
});

router.get("/generations/:id", async (req, res): Promise<void> => {
  const params = GetGenerationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [gen] = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.id, params.data.id));

  if (!gen) {
    res.status(404).json({ error: "Generation not found" });
    return;
  }

  res.json(await formatGeneration(gen));
});

router.post("/generations", async (req, res): Promise<void> => {
  const parsed = CreateGenerationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt, type, aspectRatio, model, style, negativePrompt, title, notes, enhancePrompt, duration } = parsed.data;
  const genType = type ?? "image";

  const [gen] = await db
    .insert(generationsTable)
    .values({
      prompt,
      type: genType,
      aspectRatio: aspectRatio ?? "1:1",
      model: model ?? "flux",
      style: style ?? null,
      title: title ?? null,
      notes: notes ?? null,
      settings: JSON.stringify({ negativePrompt: negativePrompt ?? null, enhancePrompt: enhancePrompt ?? false, duration: duration ?? null }),
      status: "generating",
    })
    .returning();

  // Fire off generation in background
  if (genType === "video") {
    const isRunway = (model ?? "").startsWith("runway");
    generateVideoAsync(gen.id, prompt, aspectRatio ?? "16:9", style, duration ?? "5s", isRunway).catch((err) => {
      req.log.error({ err, generationId: gen.id }, "Background video generation failed");
    });
  } else {
    generateImageAsync(gen.id, prompt, aspectRatio ?? "1:1", style, negativePrompt, enhancePrompt ?? false).catch(
      (err) => {
        req.log.error({ err, generationId: gen.id }, "Background generation failed");
      }
    );
  }

  res.status(201).json(await formatGeneration(gen));
});

const STITCH_CLIP_COUNTS: Record<string, number> = {
  "30s": 3,
  "60s": 6,
};

async function generateVideoAsync(
  generationId: number,
  prompt: string,
  aspectRatio: string,
  style: string | null | undefined,
  duration: string | null | undefined,
  useRunway = false
): Promise<void> {
  try {
    let videoUrl: string;
    const clipCount = STITCH_CLIP_COUNTS[duration ?? ""];

    if (clipCount) {
      // Long-form: stitch multiple 10s clips
      const { generateAndStitchClips } = await import("../lib/video-stitch.js");
      const publicDir = path.resolve(process.cwd(), "public", "generations");
      await fs.mkdir(publicDir, { recursive: true });

      videoUrl = await generateAndStitchClips(
        clipCount,
        async (_index) => {
          if (useRunway) {
            const { generateVideoWithRunway } = await import("../lib/runway-gen.js");
            return generateVideoWithRunway(prompt, aspectRatio, style, "10s");
          } else {
            const { generateVideoFromPrompt } = await import("../lib/video-gen.js");
            return generateVideoFromPrompt(prompt, aspectRatio, style, "10s");
          }
        },
        publicDir
      );
    } else {
      // Short clip — single generation
      if (useRunway) {
        const { generateVideoWithRunway } = await import("../lib/runway-gen.js");
        videoUrl = await generateVideoWithRunway(prompt, aspectRatio, style, duration);
      } else {
        const { generateVideoFromPrompt } = await import("../lib/video-gen.js");
        videoUrl = await generateVideoFromPrompt(prompt, aspectRatio, style, duration);
      }
    }

    await db
      .update(generationsTable)
      .set({ status: "completed", imageUrl: videoUrl, thumbnailUrl: videoUrl, updatedAt: new Date() })
      .where(eq(generationsTable.id, generationId));
  } catch (_err) {
    await db
      .update(generationsTable)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(generationsTable.id, generationId));
  }
}

async function generateImageAsync(
  generationId: number,
  prompt: string,
  aspectRatio: string,
  style: string | null | undefined,
  negativePrompt: string | null | undefined,
  enhancePrompt: boolean
): Promise<void> {
  try {
    const { generateImageFromPrompt } = await import("../lib/image-gen.js");
    const imageUrl = await generateImageFromPrompt(prompt, aspectRatio, style, negativePrompt, enhancePrompt);

    await db
      .update(generationsTable)
      .set({ status: "completed", imageUrl, thumbnailUrl: imageUrl, updatedAt: new Date() })
      .where(eq(generationsTable.id, generationId));
  } catch (_err) {
    await db
      .update(generationsTable)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(generationsTable.id, generationId));
  }
}

router.patch("/generations/:id", async (req, res): Promise<void> => {
  const params = UpdateGenerationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateGenerationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof generationsTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  if (parsed.data.isFavorite !== undefined) updates.isFavorite = parsed.data.isFavorite;
  if (parsed.data.prompt !== undefined) updates.prompt = parsed.data.prompt;
  if (parsed.data.badgeName !== undefined) updates.badgeName = parsed.data.badgeName;
  if (parsed.data.badgeLink !== undefined) updates.badgeLink = parsed.data.badgeLink;

  const [gen] = await db
    .update(generationsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(generationsTable.id, params.data.id))
    .returning();

  if (!gen) {
    res.status(404).json({ error: "Generation not found" });
    return;
  }

  res.json(await formatGeneration(gen));
});

router.delete("/generations/:id", async (req, res): Promise<void> => {
  const params = DeleteGenerationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [gen] = await db
    .delete(generationsTable)
    .where(eq(generationsTable.id, params.data.id))
    .returning();

  if (!gen) {
    res.status(404).json({ error: "Generation not found" });
    return;
  }

  // Also remove from collections
  await db
    .delete(collectionItemsTable)
    .where(eq(collectionItemsTable.generationId, params.data.id));

  res.sendStatus(204);
});

router.post("/generations/:id/variations", async (req, res): Promise<void> => {
  const params = CreateVariationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateVariationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [parent] = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.id, params.data.id));

  if (!parent) {
    res.status(404).json({ error: "Generation not found" });
    return;
  }

  const variationPrompt = parsed.data.prompt ?? parent.prompt;
  const variationStyle = parsed.data.style ?? parent.style;
  const variationAspectRatio = parsed.data.aspectRatio ?? parent.aspectRatio;

  const [variation] = await db
    .insert(generationsTable)
    .values({
      prompt: variationPrompt,
      type: parent.type,
      aspectRatio: variationAspectRatio,
      model: parent.model,
      style: variationStyle,
      settings: parent.settings,
      status: "generating",
      parentId: parent.id,
    })
    .returning();

  generateImageAsync(variation.id, variationPrompt, variationAspectRatio, variationStyle, null, false).catch(
    (err) => {
      req.log.error({ err, generationId: variation.id }, "Variation generation failed");
    }
  );

  res.status(201).json(await formatGeneration(variation));
});

export default router;
