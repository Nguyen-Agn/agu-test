// Simplified schema for Vercel functions
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  studentId: text('student_id').notNull().unique(),
  email: text('email').notNull(),
  major: text('major').notNull(),
  phone: text('phone').notNull(),
  totalPoints: integer('total_points').default(0),
  password: text('password').notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  wasteType: text('waste_type').notNull(),
  weight: text('weight').notNull(),
  points: integer('points').notNull(),
  gift: text('gift'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const marketSessions = pgTable('market_sessions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  date: timestamp('date').notNull(),
  location: text('location').notNull(),
  timeSlot: text('time_slot').notNull(),
  wasteTypes: text('waste_types').notNull(),
  gifts: text('gifts').notNull(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export default {
  students,
  transactions,
  marketSessions,
  admins,
};