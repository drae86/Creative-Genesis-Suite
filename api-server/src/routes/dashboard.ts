import { Router, type IRouter } from "express";
import { eq, desc, count, gte, lte } from "drizzle-orm";
import { db, generationsTable, collectionsTable, glassRoomTable } from "@workspace/db";
import {
  GetDashboardActivityQueryParams,
  GetPublicGalleryQueryParams,
  ListGlassRoomQueryParams,
  SubmitToGlassRoomBody,
  RemoveFromGlassRoomParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

  const [
    [{ value: totalImages }],
    [{ value: totalVideos }],
    [{ value: totalCollections }],
    [{ value: totalFavorites }],
    [{ value: generationsToday }],
    [{ value: generationsThisWeek }],
  ] = await Promise.all([
    db.select({ value: count() }).from(generationsTable).where(eq(generationsTable.type, "image")),
    db.select({ value: count() }).from(generationsTable).where(eq(generationsTable.type, "video")),
    db.select({ value: count() }).from(collectionsTable),
    db.select({ value: count() }).from(generationsTable).where(eq(generationsTable.isFavorite, true)),
    db
      .select({ value: count() })
      .from(generationsTable)
      .where(gte(generationsTable.createdAt, startOfToday)),
    db
      .select({ value: count() })
      .from(generationsTable)
      .where(gte(generationsTable.createdAt, startOfWeek)),
  ]);

  res.json({
    totalImages: totalImages ?? 0,
    totalVideos: totalVideos ?? 0,
    totalCollections: totalCollections ?? 0,
    totalFavorites: totalFavorites ?? 0,
    generationsToday: generationsToday ?? 0,
    generationsThisWeek: generationsThisWeek ?? 0,
  });
});

router.get("/glass-room", async (req, res): Promise<void> => {
  const parsed = ListGlassRoomQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit, offset } = parsed.data;
  const now = new Date();

  const rows = await db
    .select()
    .from(glassRoomTable)
    .where(gte(glassRoomTable.displayUntil, now))
    .orderBy(desc(glassRoomTable.createdAt))
    .limit(limit ?? 50)
    .offset(offset ?? 0);

  const entries = await Promise.all(
    rows.map(async (row) => {
      const [gen] = await db
        .select()
        .from(generationsTable)
        .where(eq(generationsTable.id, row.generationId))
        .limit(1);
      return {
        ...row,
        generation: gen ? { ...gen, collectionIds: [] } : null,
      };
    })
  );

  res.json(entries.filter((e) => e.generation !== null));
});

router.post("/glass-room", async (req, res): Promise<void> => {
  const parsed = SubmitToGlassRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { generationId, creatorName, creatorContact, contactPublic } = parsed.data;

  const [gen] = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.id, generationId))
    .limit(1);

  if (!gen) {
    res.status(404).json({ error: "Generation not found" });
    return;
  }

  const displayUntil = new Date();
  displayUntil.setDate(displayUntil.getDate() + 20);

  const [entry] = await db
    .insert(glassRoomTable)
    .values({
      generationId,
      creatorName: creatorName ?? null,
      creatorContact: creatorContact ?? null,
      contactPublic: contactPublic ?? false,
      displayUntil,
    })
    .returning();

  res.status(201).json({
    ...entry,
    generation: { ...gen, collectionIds: [] },
  });
});

router.delete("/glass-room/:id", async (req, res): Promise<void> => {
  const parsed = RemoveFromGlassRoomParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { id } = parsed.data;

  const [deleted] = await db
    .delete(glassRoomTable)
    .where(eq(glassRoomTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).end();
});

router.get("/public-gallery", async (req, res): Promise<void> => {
  const parsed = GetPublicGalleryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit, offset } = parsed.data;

  const rows = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.status, "completed"))
    .orderBy(desc(generationsTable.createdAt))
    .limit(limit ?? 100)
    .offset(offset ?? 0);

  res.json(rows.map((g) => ({ ...g, collectionIds: [] })));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const parsed = GetDashboardActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit } = parsed.data;

  const recent = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.status, "completed"))
    .orderBy(desc(generationsTable.createdAt))
    .limit(limit ?? 20);

  const activity = recent.map((gen) => ({
    id: gen.id,
    type: "generated",
    description: `Generated ${gen.type}: ${gen.title ?? gen.prompt.slice(0, 60)}`,
    generation: {
      ...gen,
      collectionIds: [],
    },
    createdAt: gen.createdAt,
  }));

  res.json(activity);
});

export default router;
