import { Student, Transaction, MarketSession, Admin, InsertStudent, InsertTransaction, InsertMarketSession, InsertAdmin } from "@shared/schema";
import { localDB } from "./localStorageDb";

// Client-side storage interface that matches the server storage interface
export interface IClientStorage {
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getAllStudents(): Promise<Student[]>;

  // Transaction operations
  getTransactionsByStudentId(studentId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;

  // Market session operations
  getAllMarketSessions(): Promise<MarketSession[]>;
  createMarketSession(session: InsertMarketSession): Promise<MarketSession>;
  updateMarketSession(id: number, updates: Partial<MarketSession>): Promise<MarketSession | undefined>;
  deleteMarketSession(id: number): Promise<boolean>;

  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

// Client storage implementation using LocalStorage
export class ClientStorage implements IClientStorage {
  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    return localDB.getStudent(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return localDB.getStudentByStudentId(studentId);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return localDB.getStudentByEmail(email);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    return localDB.createStudent(student);
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    return localDB.updateStudent(id, updates);
  }

  async deleteStudent(id: number): Promise<boolean> {
    return localDB.deleteStudent(id);
  }

  async getAllStudents(): Promise<Student[]> {
    return localDB.getAllStudents();
  }

  // Transaction operations
  async getTransactionsByStudentId(studentId: number): Promise<Transaction[]> {
    return localDB.getTransactionsByStudentId(studentId);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    return localDB.createTransaction(transaction);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return localDB.getAllTransactions();
  }

  // Market session operations
  async getAllMarketSessions(): Promise<MarketSession[]> {
    return localDB.getAllMarketSessions();
  }

  async createMarketSession(session: InsertMarketSession): Promise<MarketSession> {
    return localDB.createMarketSession(session);
  }

  async updateMarketSession(id: number, updates: Partial<MarketSession>): Promise<MarketSession | undefined> {
    return localDB.updateMarketSession(id, updates);
  }

  async deleteMarketSession(id: number): Promise<boolean> {
    return localDB.deleteMarketSession(id);
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return localDB.getAdminByUsername(username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    return localDB.createAdmin(admin);
  }
}

// Export singleton instance
export const clientStorage = new ClientStorage();