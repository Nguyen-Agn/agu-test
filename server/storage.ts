import {
  students,
  transactions,
  marketSessions,
  admins,
  type Student,
  type InsertStudent,
  type Transaction,
  type InsertTransaction,
  type MarketSession,
  type InsertMarketSession,
  type Admin,
  type InsertAdmin,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gt } from "drizzle-orm";

export interface IStorage {
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(
    id: number,
    updates: Partial<Student>,
  ): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getAllStudents(): Promise<Student[]>;

  // Transaction operations
  getTransactionsByStudentId(studentId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;

  // Market session operations
  getAllMarketSessions(): Promise<MarketSession[]>;
  createMarketSession(session: InsertMarketSession): Promise<MarketSession>;
  updateMarketSession(
    id: number,
    updates: Partial<MarketSession>,
  ): Promise<MarketSession | undefined>;
  deleteMarketSession(id: number): Promise<boolean>;

  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getUpcomingMarketSession(): Promise<MarketSession | null>;
}

export class DatabaseStorage implements IStorage {
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student || undefined;
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.email, email));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values({
        ...insertStudent,
        totalPoints: 0,
      })
      .returning();
    return student;
  }

  async updateStudent(
    id: number,
    updates: Partial<Student>,
  ): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(updates)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getTransactionsByStudentId(studentId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.studentId, studentId))
      .orderBy(desc(transactions.date));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        gift: insertTransaction.gift || null,
      })
      .returning();

    // Update student points
    const student = await this.getStudent(insertTransaction.studentId);
    if (student) {
      await this.updateStudent(student.id, {
        totalPoints: student.totalPoints + insertTransaction.points
      });
    }

    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date));
  }

  async getAllMarketSessions(): Promise<MarketSession[]> {
    return await db
      .select()
      .from(marketSessions)
      .orderBy(marketSessions.date);
  }

  async createMarketSession(insertSession: InsertMarketSession): Promise<MarketSession> {
    const [session] = await db
      .insert(marketSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateMarketSession(
    id: number,
    updates: Partial<MarketSession>,
  ): Promise<MarketSession | undefined> {
    const [session] = await db
      .update(marketSessions)
      .set(updates)
      .where(eq(marketSessions.id, id))
      .returning();
    return session || undefined;
  }

  async deleteMarketSession(id: number): Promise<boolean> {
    const result = await db.delete(marketSessions).where(eq(marketSessions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async getUpcomingMarketSession(): Promise<MarketSession | null> {
    const now = new Date();
    const [session] = await db
      .select()
      .from(marketSessions)
      .where(gt(marketSessions.date, now))
      .orderBy(marketSessions.date)
      .limit(1);
    return session || null;
  }
}

export const storage = new DatabaseStorage();