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
  type InsertAdmin
} from "@shared/schema";

export interface IStorage {
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

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private transactions: Map<number, Transaction>;
  private marketSessions: Map<number, MarketSession>;
  private admins: Map<number, Admin>;
  private currentStudentId: number;
  private currentTransactionId: number;
  private currentMarketSessionId: number;
  private currentAdminId: number;

  constructor() {
    this.students = new Map();
    this.transactions = new Map();
    this.marketSessions = new Map();
    this.admins = new Map();
    this.currentStudentId = 1;
    this.currentTransactionId = 1;
    this.currentMarketSessionId = 1;
    this.currentAdminId = 1;
    
    // Initialize with default admin
    this.createAdmin({
      username: "admin",
      password: "admin123", // In production, this should be hashed
    });
    
    // Initialize with sample market session
    this.createMarketSession({
      title: "Phiên chợ tháng 12",
      date: new Date("2024-12-25T08:00:00Z"),
      location: "Sân trước thư viện trường",
      timeSlot: "8:00 - 17:00",
      wasteTypes: "Giấy, nhựa, kim loại",
      gifts: "Cây xanh, túi vải",
    });
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.studentId === studentId,
    );
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = { 
      ...insertStudent, 
      id, 
      totalPoints: 0 
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getTransactionsByStudentId(studentId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      date: new Date(),
    };
    this.transactions.set(id, transaction);
    
    // Update student's total points
    const student = this.students.get(insertTransaction.studentId);
    if (student) {
      student.totalPoints += insertTransaction.points;
      this.students.set(student.id, student);
    }
    
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAllMarketSessions(): Promise<MarketSession[]> {
    return Array.from(this.marketSessions.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createMarketSession(insertSession: InsertMarketSession): Promise<MarketSession> {
    const id = this.currentMarketSessionId++;
    const session: MarketSession = { ...insertSession, id };
    this.marketSessions.set(id, session);
    return session;
  }

  async updateMarketSession(id: number, updates: Partial<MarketSession>): Promise<MarketSession | undefined> {
    const session = this.marketSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.marketSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteMarketSession(id: number): Promise<boolean> {
    return this.marketSessions.delete(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username,
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.currentAdminId++;
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }
}

export const storage = new MemStorage();
