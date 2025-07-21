import { 
  type Student, 
  type InsertStudent, 
  type Transaction, 
  type InsertTransaction,
  type MarketSession,
  type InsertMarketSession,
  type Admin,
  type InsertAdmin
} from "@shared/schema";
import { db, COLLECTIONS } from "./firebase";
import admin from 'firebase-admin';

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

export class FirebaseStorage implements IStorage {
  constructor() {
    // Initialize with default admin and sample data if needed
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Check if admin exists, if not create one
    const adminExists = await this.getAdminByUsername("admin");
    if (!adminExists) {
      await this.createAdmin({
        username: "admin",
        password: "admin123", // In production, this should be hashed
      });
    }

    // Check if sample market session exists
    const sessions = await this.getAllMarketSessions();
    if (sessions.length === 0) {
      await this.createMarketSession({
        title: "Phiên chợ tháng 12",
        date: new Date("2024-12-25T08:00:00Z"),
        location: "Sân trước thư viện trường",
        timeSlot: "8:00 - 17:00",
        wasteTypes: "Giấy, nhựa, kim loại",
        gifts: "Cây xanh, túi vải",
      });
    }
  }

  async getStudent(id: number): Promise<Student | undefined> {
    try {
      const doc = await db.collection(COLLECTIONS.STUDENTS).doc(id.toString()).get();
      if (!doc.exists) return undefined;
      return { id, ...doc.data() } as Student;
    } catch (error) {
      console.error('Error getting student:', error);
      return undefined;
    }
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    try {
      const snapshot = await db.collection(COLLECTIONS.STUDENTS)
        .where('studentId', '==', studentId)
        .limit(1)
        .get();
      
      if (snapshot.empty) return undefined;
      
      const doc = snapshot.docs[0];
      return { id: parseInt(doc.id), ...doc.data() } as Student;
    } catch (error) {
      console.error('Error getting student by studentId:', error);
      return undefined;
    }
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    try {
      const snapshot = await db.collection(COLLECTIONS.STUDENTS)
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) return undefined;
      
      const doc = snapshot.docs[0];
      return { id: parseInt(doc.id), ...doc.data() } as Student;
    } catch (error) {
      console.error('Error getting student by email:', error);
      return undefined;
    }
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    try {
      // Generate a unique ID
      const id = Date.now();
      const student: Student = { 
        ...insertStudent, 
        id, 
        totalPoints: 0 
      };
      
      await db.collection(COLLECTIONS.STUDENTS).doc(id.toString()).set({
        ...insertStudent,
        totalPoints: 0
      });
      
      return student;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    try {
      const docRef = db.collection(COLLECTIONS.STUDENTS).doc(id.toString());
      const doc = await docRef.get();
      
      if (!doc.exists) return undefined;
      
      await docRef.update(updates);
      const updatedDoc = await docRef.get();
      return { id, ...updatedDoc.data() } as Student;
    } catch (error) {
      console.error('Error updating student:', error);
      return undefined;
    }
  }

  async deleteStudent(id: number): Promise<boolean> {
    try {
      await db.collection(COLLECTIONS.STUDENTS).doc(id.toString()).delete();
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      return false;
    }
  }

  async getAllStudents(): Promise<Student[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.STUDENTS).get();
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Student[];
    } catch (error) {
      console.error('Error getting all students:', error);
      return [];
    }
  }

  async getTransactionsByStudentId(studentId: number): Promise<Transaction[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.TRANSACTIONS)
        .where('studentId', '==', studentId)
        .orderBy('date', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting transactions by student ID:', error);
      return [];
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    try {
      const id = Date.now();
      const transaction: Transaction = {
        ...insertTransaction,
        id,
        date: new Date(),
      };
      
      await db.collection(COLLECTIONS.TRANSACTIONS).doc(id.toString()).set({
        ...insertTransaction,
        date: new Date()
      });
      
      // Update student's total points
      const studentDocRef = db.collection(COLLECTIONS.STUDENTS).doc(insertTransaction.studentId.toString());
      await studentDocRef.update({
        totalPoints: admin.firestore.FieldValue.increment(insertTransaction.points)
      });
      
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.TRANSACTIONS)
        .orderBy('date', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return [];
    }
  }

  async getAllMarketSessions(): Promise<MarketSession[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.MARKET_SESSIONS)
        .orderBy('date', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as MarketSession[];
    } catch (error) {
      console.error('Error getting market sessions:', error);
      return [];
    }
  }

  async createMarketSession(insertSession: InsertMarketSession): Promise<MarketSession> {
    try {
      const id = Date.now();
      const session: MarketSession = { ...insertSession, id };
      
      await db.collection(COLLECTIONS.MARKET_SESSIONS).doc(id.toString()).set(insertSession);
      
      return session;
    } catch (error) {
      console.error('Error creating market session:', error);
      throw error;
    }
  }

  async updateMarketSession(id: number, updates: Partial<MarketSession>): Promise<MarketSession | undefined> {
    try {
      const docRef = db.collection(COLLECTIONS.MARKET_SESSIONS).doc(id.toString());
      const doc = await docRef.get();
      
      if (!doc.exists) return undefined;
      
      await docRef.update(updates);
      const updatedDoc = await docRef.get();
      return { id, ...updatedDoc.data() } as MarketSession;
    } catch (error) {
      console.error('Error updating market session:', error);
      return undefined;
    }
  }

  async deleteMarketSession(id: number): Promise<boolean> {
    try {
      await db.collection(COLLECTIONS.MARKET_SESSIONS).doc(id.toString()).delete();
      return true;
    } catch (error) {
      console.error('Error deleting market session:', error);
      return false;
    }
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    try {
      const snapshot = await db.collection(COLLECTIONS.ADMINS)
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (snapshot.empty) return undefined;
      
      const doc = snapshot.docs[0];
      return { id: parseInt(doc.id), ...doc.data() } as Admin;
    } catch (error) {
      console.error('Error getting admin by username:', error);
      return undefined;
    }
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    try {
      const id = Date.now();
      const admin: Admin = { ...insertAdmin, id };
      
      await db.collection(COLLECTIONS.ADMINS).doc(id.toString()).set(insertAdmin);
      
      return admin;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }
}

// Temporarily using in-memory storage for development
// To use Firebase, change to: export const storage = new FirebaseStorage();
export const storage = new MemStorage();
