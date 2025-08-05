import { clientStorage } from './clientStorage';
import { LoginData, Student, InsertStudent, Admin, MarketSession, InsertMarketSession, Transaction, InsertTransaction } from '@shared/schema';

// Session management
export interface Session {
  sessionId: string;
  userId: number;
  isAdmin: boolean;
  username?: string;
  createdAt: Date;
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();

  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  createSession(userId: number, isAdmin: boolean, username?: string): string {
    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, {
      sessionId,
      userId,
      isAdmin,
      username,
      createdAt: new Date()
    });
    
    // Store in localStorage for persistence
    localStorage.setItem('currentSession', JSON.stringify({
      sessionId,
      userId,
      isAdmin,
      username
    }));
    
    return sessionId;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getCurrentSession(): Session | null {
    try {
      const stored = localStorage.getItem('currentSession');
      if (stored) {
        const session = JSON.parse(stored);
        // Recreate session in memory
        this.sessions.set(session.sessionId, {
          ...session,
          createdAt: new Date()
        });
        return session;
      }
      
      // Also check for legacy sessionId
      const legacySessionId = localStorage.getItem('sessionId');
      if (legacySessionId) {
        // Clean up legacy sessionId
        localStorage.removeItem('sessionId');
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
    return null;
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
    localStorage.removeItem('currentSession');
    localStorage.removeItem('sessionId');
  }
}

const sessionManager = new SessionManager();

// Client-side API functions that simulate server endpoints
export const clientAPI = {
  // Authentication
  async login(loginData: LoginData): Promise<{ isAdmin: boolean; sessionId: string }> {
    const { identifier, password } = loginData;
    
    // Try admin login first
    const admin = await clientStorage.getAdminByUsername(identifier);
    if (admin && admin.password === password) {
      const sessionId = sessionManager.createSession(admin.id, true, admin.username);
      return { isAdmin: true, sessionId };
    }

    // Try student login
    const student = await clientStorage.getStudentByStudentId(identifier) || 
                   await clientStorage.getStudentByEmail(identifier);
    if (student && student.password === password) {
      const sessionId = sessionManager.createSession(student.id, false);
      return { isAdmin: false, sessionId };
    }

    throw new Error('Thông tin đăng nhập không chính xác');
  },

  async logout(): Promise<{ success: boolean }> {
    const session = sessionManager.getCurrentSession();
    if (session) {
      sessionManager.destroySession(session.sessionId);
    }
    return { success: true };
  },

  async register(studentData: InsertStudent): Promise<Student> {
    // Check if student ID or email already exists
    const existingByStudentId = await clientStorage.getStudentByStudentId(studentData.studentId);
    if (existingByStudentId) {
      throw new Error('MSSV đã tồn tại');
    }

    const existingByEmail = await clientStorage.getStudentByEmail(studentData.email);
    if (existingByEmail) {
      throw new Error('Email đã tồn tại');
    }

    return clientStorage.createStudent(studentData);
  },

  async getCurrentUser(): Promise<{ student?: Student; admin?: Admin; isAdmin: boolean } | null> {
    const session = sessionManager.getCurrentSession();
    if (!session) {
      return null;
    }

    if (session.isAdmin) {
      const admin = await clientStorage.getAdminByUsername(session.username || '');
      return admin ? { admin, isAdmin: true } : null;
    } else {
      const student = await clientStorage.getStudent(session.userId);
      return student ? { student, isAdmin: false } : null;
    }
  },

  // Student operations
  async getStudentDashboard(): Promise<{ student: Student; transactions: any[]; stats: { totalWeight: string; giftsReceived: number } }> {
    const session = sessionManager.getCurrentSession();
    if (!session || session.isAdmin) {
      throw new Error('Unauthorized');
    }

    const student = await clientStorage.getStudent(session.userId);
    if (!student) {
      throw new Error('Student not found');
    }

    const transactions = await clientStorage.getTransactionsByStudentId(student.id);
    
    // Calculate stats
    const totalWeight = transactions.reduce((sum, t) => sum + parseFloat(t.weight || '0'), 0).toFixed(2);
    const giftsReceived = transactions.filter(t => t.gift && t.gift.trim() !== '').length;
    
    return {
      student,
      transactions,
      stats: {
        totalWeight,
        giftsReceived
      }
    };
  },

  // Admin operations
  async getAllStudents(): Promise<Student[]> {
    const session = sessionManager.getCurrentSession();
    if (!session || !session.isAdmin) {
      throw new Error('Admin access required');
    }
    return clientStorage.getAllStudents();
  },

  async getAllTransactions(): Promise<any[]> {
    const session = sessionManager.getCurrentSession();
    if (!session || !session.isAdmin) {
      throw new Error('Admin access required');
    }
    return clientStorage.getAllTransactions();
  },

  async createTransaction(transactionData: any): Promise<any> {
    const session = sessionManager.getCurrentSession();
    if (!session || !session.isAdmin) {
      throw new Error('Admin access required');
    }
    return clientStorage.createTransaction(transactionData);
  },

  // Market sessions
  async getMarketSessions(): Promise<MarketSession[]> {
    return clientStorage.getAllMarketSessions();
  },

  async getUpcomingMarketSession(): Promise<MarketSession | null> {
    const sessions = await this.getMarketSessions();
    const now = new Date();
    
    const upcoming = sessions
      .filter(session => new Date(session.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return upcoming[0] || null;
  },

  async createMarketSession(sessionData: InsertMarketSession): Promise<MarketSession> {
    const session = sessionManager.getCurrentSession();
    if (!session || !session.isAdmin) {
      throw new Error('Admin access required');
    }
    return clientStorage.createMarketSession(sessionData);
  },

  async updateMarketSession(id: number, updates: Partial<MarketSession>): Promise<MarketSession | undefined> {
    const session = sessionManager.getCurrentSession();
    if (!session || !session.isAdmin) {
      throw new Error('Admin access required');
    }
    return clientStorage.updateMarketSession(id, updates);
  },

  async deleteMarketSession(id: number): Promise<boolean> {
    const session = sessionManager.getCurrentSession();
    if (!session || !session.isAdmin) {
      throw new Error('Admin access required');
    }
    return clientStorage.deleteMarketSession(id);
  }
};

// Helper function to check authentication status
export const checkAuth = (): boolean => {
  const session = sessionManager.getCurrentSession();
  return session !== null;
};

// Helper function to check admin status
export const checkAdminAuth = (): boolean => {
  const session = sessionManager.getCurrentSession();
  return session !== null && session.isAdmin;
};