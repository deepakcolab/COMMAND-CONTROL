import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vcs = pgTable("vcs", {
  vcid: serial("vcid").primaryKey(),
  title: text("title").notNull(),
  chairedBy: text("chaired_by").notNull(), 
  hostStudio: text("host_studio").notNull(),
  vcAssigned: text("vc_assigned").notNull(),
  destStudios: text("dest_studios").array(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  participantsCount: integer("participants_count").notNull(),
  status: varchar("status", { enum: ["upcoming", "Live", "completed"] }).notNull(), 
  coordinatorName: text("coordinator_name"),
  ipPhone: text("ip_phone"),  
  location: text("location").notNull(),
});

export const insertVcSchema = createInsertSchema(vcs).omit({ vcid: true });
export type InsertVc = z.infer<typeof insertVcSchema>;
export type Vc = typeof vcs.$inferSelect;

export type DashboardStats = {
  totalVcsToday: number;
  totalOngoingVcs: number;
  totalUpcomingVcs: number;
  completedVcs: number;
  averageDurationMins: number;
  totalParticipantsToday: number;
};
