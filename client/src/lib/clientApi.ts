import { LoginData, Student, InsertStudent, Admin, MarketSession, InsertMarketSession, Transaction, InsertTransaction } from '@shared/schema';

// Client API for communicating with the server
export const clientAPI = {
  // Session management
  async login(credentials: LoginData) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    if (data.sessionId) {
      localStorage.setItem('sessionId', data.sessionId);
    }
    
    return data;
  },

  async register(studentData: InsertStudent) {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    if (data.sessionId) {
      localStorage.setItem('sessionId', data.sessionId);
    }
    
    return data;
  },

  async logout() {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    
    localStorage.removeItem('sessionId');
    return response.ok;
  },

  async getCurrentUser() {
    const response = await fetch('/api/me', {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    
    return response.json();
  },

  // Student operations
  async getStudentDashboard() {
    const response = await fetch('/api/student/dashboard', {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard');
    }
    
    return response.json();
  },

  // Market session operations
  async getMarketSessions(): Promise<MarketSession[]> {
    const response = await fetch('/api/market-sessions');
    
    if (!response.ok) {
      throw new Error('Failed to fetch market sessions');
    }
    
    return response.json();
  },

  async getUpcomingMarketSession(): Promise<MarketSession | null> {
    const response = await fetch('/api/upcoming-session');
    
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming session');
    }
    
    return response.json();
  },

  // Admin operations
  async getStudents(): Promise<Student[]> {
    const response = await fetch('/api/admin/students', {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    
    return response.json();
  },

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const response = await fetch('/api/admin/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create transaction');
    }
    
    return response.json();
  },

  async deleteStudent(id: number): Promise<boolean> {
    const response = await fetch(`/api/admin/students/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    
    return response.ok;
  },

  async createMarketSession(sessionData: InsertMarketSession): Promise<MarketSession> {
    const response = await fetch('/api/admin/market-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
      body: JSON.stringify(sessionData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create market session');
    }
    
    return response.json();
  },

  async updateMarketSession(id: number, updates: Partial<MarketSession>): Promise<MarketSession> {
    const response = await fetch(`/api/admin/market-sessions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update market session');
    }
    
    return response.json();
  },

  async deleteMarketSession(id: number): Promise<boolean> {
    const response = await fetch(`/api/admin/market-sessions/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    
    return response.ok;
  },
};