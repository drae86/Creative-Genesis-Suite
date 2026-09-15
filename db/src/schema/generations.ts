import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generationsTable = pgTable("generations", {
  id: serial("id").primaryKey(),
  title: text("title"),
  prompt: text("prompt").notNull(),
  enhancedPrompt: text("enhanced_prompt"),
  type: text("type").notNull().default("image"), // "image" | "video"
  status: text("status").notNull().default("pending"), // "pending" | "generating" | "completed" | "failed"
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  model: text("model").notNull().default("flux"),
  style: text("style"),
  settings: text("settings").notNull().default("{}"), // JSON stringified settings
  notes: text("notes"),
  badgeName: text("badge_name"),
  badgeLink: text("badge_link"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  parentId: integer("parent_id"), // for variations
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGenerationSchema = createInsertSchema(generationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generationsTable.$inferSelect;
