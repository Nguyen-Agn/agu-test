import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  studentId: text("student_id").notNull().unique(),
  email: text("email").notNull().unique(),
  major: text("major").notNull(),
  phone: text("phone").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  wasteType: text("waste_type").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  points: integer("points").notNull(),
  gift: text("gift"),
  date: timestamp("date").notNull().defaultNow(),
});

export const marketSessions = pgTable("market_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  timeSlot: text("time_slot").notNull(),
  wasteTypes: text("waste_types").notNull(),
  gifts: text("gifts").notNull(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  totalPoints: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertMarketSessionSchema = createInsertSchema(marketSessions).omit({
  id: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập MSSV hoặc username"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type MarketSession = typeof marketSessions.$inferSelect;
export type InsertMarketSession = z.infer<typeof insertMarketSessionSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type LoginData = z.infer<typeof loginSchema>;
