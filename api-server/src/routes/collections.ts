import { Router, type IRouter } from "express";
import { eq, desc, count, inArray } from "drizzle-orm";
import { db, collectionsTable, collectionItemsTable, generationsTable } from "@workspace/db";
import {
  CreateCollectionBody,
  UpdateCollectionBody,
  UpdateCollectionParams,
  GetCollectionParams,
  DeleteCollectionParams,
  AddToCollectionParams,
  AddToCollectionBody,
  RemoveFromCollectionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getCollectionWithCount(collection: typeof collectionsTable.$inferSelect) {
  const [{ value: itemCount }] = await db
    .select({ value: count() })
    .from(collectionItemsTable)
    .where(eq(collectionItemsTable.collectionId, collection.id));

  return {
    ...collection,
    itemCount: itemCount ?? 0,
  };
}

router.get("/collections", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(collectionsTable)
    .orderBy(desc(collectionsTable.createdAt));

  const formatted = await Promise.all(rows.map(getCollectionWithCount));
  res.json(formatted);
});

router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [collection] = await db
    .insert(collectionsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .returning();

  res.status(201).json(await getCollectionWithCount(collection));
});

router.get("/collections/:id", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [collection] = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.id, params.data.id));

  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const items = await db
    .select({ generationId: collectionItemsTable.generationId })
    .from(collectionItemsTable)
    .where(eq(collectionItemsTable.collectionId, collection.id));

  const generationIds = items.map((i) => i.generationId);

  let generations: (typeof generationsTable.$inferSelect & { collectionIds: number[] })[] = [];
  if (generationIds.length > 0) {
    const gens = await db
      .select()
      .from(generationsTable)
      .where(
        generationIds.length === 1
          ? eq(generationsTable.id, generationIds[0])
          : inArray(generationsTable.id, generationIds)
      )
      .orderBy(desc(generationsTable.createdAt));

    generations = gens.map((g) => ({ ...g, collectionIds: [collection.id] }));
  }

  res.json({
    ...collection,
    itemCount: generationIds.length,
    generations,
  });
});

router.patch("/collections/:id", async (req, res): Promise<void> => {
  const params = UpdateCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof collectionsTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;

  const [collection] = await db
    .update(collectionsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(collectionsTable.id, params.data.id))
    .returning();

  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.json(await getCollectionWithCount(collection));
});

router.delete("/collections/:id", async (req, res): Promise<void> => {
  const params = DeleteCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Remove all items first
  await db
    .delete(collectionItemsTable)
    .where(eq(collectionItemsTable.collectionId, params.data.id));

  const [collection] = await db
    .delete(collectionsTable)
    .where(eq(collectionsTable.id, params.data.id))
    .returning();

  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/collections/:id/items", async (req, res): Promise<void> => {
  const params = AddToCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddToCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check collection exists
  const [collection] = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.id, params.data.id));

  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  // Check if already in collection (upsert-like)
  const existing = await db
    .select()
    .from(collectionItemsTable)
    .where(
      eq(collectionItemsTable.collectionId, params.data.id)
    );

  const alreadyIn = existing.find((e) => e.generationId === parsed.data.generationId);

  if (alreadyIn) {
    res.status(201).json({
      collectionId: alreadyIn.collectionId,
      generationId: alreadyIn.generationId,
      addedAt: alreadyIn.addedAt,
    });
    return;
  }

  const [item] = await db
    .insert(collectionItemsTable)
    .values({
      collectionId: params.data.id,
      generationId: parsed.data.generationId,
    })
    .returning();

  // Update collection cover if none
  if (!collection.coverImageUrl) {
    const [gen] = await db
      .select()
      .from(generationsTable)
      .where(eq(generationsTable.id, parsed.data.generationId));
    if (gen?.imageUrl) {
      await db
        .update(collectionsTable)
        .set({ coverImageUrl: gen.imageUrl })
        .where(eq(collectionsTable.id, params.data.id));
    }
  }

  res.status(201).json({
    collectionId: item.collectionId,
    generationId: item.generationId,
    addedAt: item.addedAt,
  });
});

router.delete("/collections/:id/items/:generationId", async (req, res): Promise<void> => {
  const params = RemoveFromCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(collectionItemsTable)
    .where(eq(collectionItemsTable.collectionId, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Item not found in collection" });
    return;
  }

  res.sendStatus(204);
});

export default router;
