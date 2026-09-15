import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const glassRoomTable = pgTable("glass_room", {
  id: serial("id").primaryKey(),
  generationId: integer("generation_id").notNull(),
  creatorName: text("creator_name"),
  creatorContact: text("creator_contact"),
  contactPublic: boolean("contact_public").notNull().default(false),
  displayUntil: timestamp("display_until", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGlassRoomSchema = createInsertSchema(glassRoomTable).omit({
  id: true,
  createdAt: true,
});
export type InsertGlassRoom = z.infer<typeof insertGlassRoomSchema>;
export type GlassRoomEntry = typeof glassRoomTable.$inferSelect;
