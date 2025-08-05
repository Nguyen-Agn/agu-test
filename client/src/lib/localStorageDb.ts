import { Student, Transaction, MarketSession, Admin, InsertStudent, InsertTransaction, InsertMarketSession, InsertAdmin } from "@shared/schema";

// Storage keys
const STORAGE_KEYS = {
  students: "waste_exchange_students",
  transactions: "waste_exchange_transactions",
  marketSessions: "waste_exchange_market_sessions",
  admins: "waste_exchange_admins",
  counters: "waste_exchange_counters",
  lastBackup: "waste_exchange_last_backup"
};

// Counter interface for auto-increment IDs
interface Counters {
  studentId: number;
  transactionId: number;
  marketSessionId: number;
  adminId: number;
}

// Database class for LocalStorage operations
export class LocalStorageDB {
  private static instance: LocalStorageDB;

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): LocalStorageDB {
    if (!LocalStorageDB.instance) {
      LocalStorageDB.instance = new LocalStorageDB();
    }
    return LocalStorageDB.instance;
  }

  // Initialize default data if not exists
  private initializeData(): void {
    // Initialize counters
    if (!localStorage.getItem(STORAGE_KEYS.counters)) {
      const counters: Counters = {
        studentId: 1,
        transactionId: 1,
        marketSessionId: 1,
        adminId: 1
      };
      localStorage.setItem(STORAGE_KEYS.counters, JSON.stringify(counters));
    }

    // Initialize empty arrays if not exists
    if (!localStorage.getItem(STORAGE_KEYS.students)) {
      localStorage.setItem(STORAGE_KEYS.students, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.transactions)) {
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.marketSessions)) {
      // Initialize default market session - set for future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
      
      const defaultSessions: MarketSession[] = [{
        id: 1,
        title: "Phiên Chợ Xanh Tuần Tới",
        date: futureDate,
        location: "Sân trước thư viện trường",
        timeSlot: "8:00 - 17:00",
        wasteTypes: "Giấy, nhựa, kim loại, chai lọ",
        gifts: "Cây xanh, túi vải, đồ dùng học tập"
      }];
      localStorage.setItem(STORAGE_KEYS.marketSessions, JSON.stringify(defaultSessions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.admins)) {
      // Initialize with default admin
      const defaultAdmins: Admin[] = [{
        id: 1,
        username: "admin",
        password: "NoAdmin123"
      }];
      localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(defaultAdmins));
    }
  }

  // Generic methods for data operations
  private getData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return [];
    }
  }

  private setData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.updateLastBackup();
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw new Error(`Không thể lưu dữ liệu ${key}`);
    }
  }

  private getNextId(type: keyof Counters): number {
    try {
      const counters: Counters = JSON.parse(localStorage.getItem(STORAGE_KEYS.counters) || "{}");
      const nextId = counters[type] || 1;
      counters[type] = nextId + 1;
      localStorage.setItem(STORAGE_KEYS.counters, JSON.stringify(counters));
      return nextId;
    } catch (error) {
      console.error("Error getting next ID:", error);
      return Date.now(); // Fallback to timestamp
    }
  }

  private updateLastBackup(): void {
    localStorage.setItem(STORAGE_KEYS.lastBackup, new Date().toISOString());
  }

  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    const students = this.getData<Student>(STORAGE_KEYS.students);
    return students.find(student => student.id === id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const students = this.getData<Student>(STORAGE_KEYS.students);
    return students.find(student => student.studentId === studentId);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const students = this.getData<Student>(STORAGE_KEYS.students);
    return students.find(student => student.email === email);
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const students = this.getData<Student>(STORAGE_KEYS.students);
    const newStudent: Student = {
      ...studentData,
      id: this.getNextId('studentId'),
      totalPoints: 0
    };
    students.push(newStudent);
    this.setData(STORAGE_KEYS.students, students);
    return newStudent;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const students = this.getData<Student>(STORAGE_KEYS.students);
    const index = students.findIndex(student => student.id === id);
    if (index === -1) return undefined;

    students[index] = { ...students[index], ...updates };
    this.setData(STORAGE_KEYS.students, students);
    return students[index];
  }

  async deleteStudent(id: number): Promise<boolean> {
    const students = this.getData<Student>(STORAGE_KEYS.students);
    const index = students.findIndex(student => student.id === id);
    if (index === -1) return false;

    students.splice(index, 1);
    this.setData(STORAGE_KEYS.students, students);
    return true;
  }

  async getAllStudents(): Promise<Student[]> {
    return this.getData<Student>(STORAGE_KEYS.students);
  }

  // Transaction operations
  async getTransactionsByStudentId(studentId: number): Promise<Transaction[]> {
    const transactions = this.getData<Transaction>(STORAGE_KEYS.transactions);
    return transactions.filter(transaction => transaction.studentId === studentId);
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const transactions = this.getData<Transaction>(STORAGE_KEYS.transactions);
    const newTransaction: Transaction = {
      ...transactionData,
      id: this.getNextId('transactionId'),
      date: new Date(),
      gift: transactionData.gift || null
    };
    transactions.push(newTransaction);
    this.setData(STORAGE_KEYS.transactions, transactions);

    // Update student points
    const student = await this.getStudent(transactionData.studentId);
    if (student) {
      await this.updateStudent(student.id, {
        totalPoints: student.totalPoints + transactionData.points
      });
    }

    return newTransaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.getData<Transaction>(STORAGE_KEYS.transactions);
  }

  // Market session operations
  async getAllMarketSessions(): Promise<MarketSession[]> {
    return this.getData<MarketSession>(STORAGE_KEYS.marketSessions);
  }

  async createMarketSession(sessionData: InsertMarketSession): Promise<MarketSession> {
    const sessions = this.getData<MarketSession>(STORAGE_KEYS.marketSessions);
    const newSession: MarketSession = {
      ...sessionData,
      id: this.getNextId('marketSessionId')
    };
    sessions.push(newSession);
    this.setData(STORAGE_KEYS.marketSessions, sessions);
    return newSession;
  }

  async updateMarketSession(id: number, updates: Partial<MarketSession>): Promise<MarketSession | undefined> {
    const sessions = this.getData<MarketSession>(STORAGE_KEYS.marketSessions);
    const index = sessions.findIndex(session => session.id === id);
    if (index === -1) return undefined;

    sessions[index] = { ...sessions[index], ...updates };
    this.setData(STORAGE_KEYS.marketSessions, sessions);
    return sessions[index];
  }

  async deleteMarketSession(id: number): Promise<boolean> {
    const sessions = this.getData<MarketSession>(STORAGE_KEYS.marketSessions);
    const index = sessions.findIndex(session => session.id === id);
    if (index === -1) return false;

    sessions.splice(index, 1);
    this.setData(STORAGE_KEYS.marketSessions, sessions);
    return true;
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const admins = this.getData<Admin>(STORAGE_KEYS.admins);
    return admins.find(admin => admin.username === username);
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const admins = this.getData<Admin>(STORAGE_KEYS.admins);
    const newAdmin: Admin = {
      ...adminData,
      id: this.getNextId('adminId')
    };
    admins.push(newAdmin);
    this.setData(STORAGE_KEYS.admins, admins);
    return newAdmin;
  }

  // Backup and restore operations
  exportData(): string {
    const data = {
      students: this.getData<Student>(STORAGE_KEYS.students),
      transactions: this.getData<Transaction>(STORAGE_KEYS.transactions),
      marketSessions: this.getData<MarketSession>(STORAGE_KEYS.marketSessions),
      admins: this.getData<Admin>(STORAGE_KEYS.admins),
      counters: JSON.parse(localStorage.getItem(STORAGE_KEYS.counters) || "{}"),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.students || !data.transactions || !data.marketSessions || !data.admins) {
        throw new Error("Dữ liệu không hợp lệ");
      }

      // Import data
      this.setData(STORAGE_KEYS.students, data.students);
      this.setData(STORAGE_KEYS.transactions, data.transactions);
      this.setData(STORAGE_KEYS.marketSessions, data.marketSessions);
      this.setData(STORAGE_KEYS.admins, data.admins);
      
      if (data.counters) {
        localStorage.setItem(STORAGE_KEYS.counters, JSON.stringify(data.counters));
      }

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeData();
  }

  resetAdminPassword(): void {
    const defaultAdmins: Admin[] = [{
      id: 1,
      username: "admin",
      password: "NoAdmin123"
    }];
    localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(defaultAdmins));
  }

  getLastBackupDate(): Date | null {
    const lastBackup = localStorage.getItem(STORAGE_KEYS.lastBackup);
    return lastBackup ? new Date(lastBackup) : null;
  }

  getStorageSize(): string {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        total += data.length;
      }
    });
    return `${(total / 1024).toFixed(2)} KB`;
  }
}

// Export singleton instance
export const localDB = LocalStorageDB.getInstance();