import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertStudentSchema, 
  insertTransactionSchema, 
  loginSchema 
} from "@shared/schema";
import { ZodError } from "zod";

// Simple session storage
interface Session {
  studentId?: number;
  isAdmin?: boolean;
}

const sessions = new Map<string, Session>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use((req, res, next) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId && sessions.has(sessionId)) {
      (req as any).session = sessions.get(sessionId);
    }
    next();
  });

  // Student registration
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      // Check if student ID or email already exists
      const existingByStudentId = await storage.getStudentByStudentId(validatedData.studentId);
      const existingByEmail = await storage.getStudentByEmail(validatedData.email);
      
      if (existingByStudentId) {
        return res.status(400).json({ message: "MSSV đã được sử dụng" });
      }
      
      if (existingByEmail) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }

      const student = await storage.createStudent(validatedData);
      
      // Create session
      const sessionId = Math.random().toString(36).substring(2);
      sessions.set(sessionId, { studentId: student.id });
      
      res.json({ 
        student: { ...student, password: undefined }, 
        sessionId 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Student login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { identifier, password } = loginSchema.parse(req.body);
      
      // Try to find student by student ID
      let student = await storage.getStudentByStudentId(identifier);
      
      if (!student) {
        // Try admin login
        const admin = await storage.getAdminByUsername(identifier);
        if (admin && admin.password === password) {
          const sessionId = Math.random().toString(36).substring(2);
          sessions.set(sessionId, { isAdmin: true });
          return res.json({ isAdmin: true, sessionId });
        }
        return res.status(401).json({ message: "MSSV hoặc mật khẩu không đúng" });
      }
      
      if (student.password !== password) {
        return res.status(401).json({ message: "MSSV hoặc mật khẩu không đúng" });
      }
      
      // Create session
      const sessionId = Math.random().toString(36).substring(2);
      sessions.set(sessionId, { studentId: student.id });
      
      res.json({ 
        student: { ...student, password: undefined }, 
        sessionId 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Logout
  app.post("/api/logout", (req: Request, res: Response) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/me", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    
    if (session.isAdmin) {
      return res.json({ isAdmin: true });
    }
    
    if (session.studentId) {
      const student = await storage.getStudent(session.studentId);
      if (!student) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      }
      return res.json({ student: { ...student, password: undefined } });
    }
    
    res.status(401).json({ message: "Session không hợp lệ" });
  });

  // Get student dashboard data
  app.get("/api/student/dashboard", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session?.studentId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    
    const student = await storage.getStudent(session.studentId);
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }
    
    const transactions = await storage.getTransactionsByStudentId(student.id);
    const totalWeight = transactions.reduce((sum, t) => sum + parseFloat(t.weight), 0);
    const giftsReceived = transactions.filter(t => t.gift).length;
    
    res.json({
      student: { ...student, password: undefined },
      transactions,
      stats: {
        totalWeight: totalWeight.toFixed(1),
        giftsReceived
      }
    });
  });

  // Get market sessions
  app.get("/api/market-sessions", async (req: Request, res: Response) => {
    try {
      const sessions = await storage.getAllMarketSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Get upcoming market session
  app.get("/api/upcoming-session", async (req: Request, res: Response) => {
    try {
      const session = await storage.getUpcomingMarketSession();
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Admin market session routes
  app.post("/api/admin/market-sessions", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session?.isAdmin) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const sessionData = req.body;
      
      // Validate required fields
      if (!sessionData.title || !sessionData.date || !sessionData.location || 
          !sessionData.timeSlot || !sessionData.wasteTypes || !sessionData.gifts) {
        return res.status(400).json({ 
          message: "Thiếu thông tin bắt buộc" 
        });
      }

      // Ensure date is a valid Date object
      if (typeof sessionData.date === 'string') {
        sessionData.date = new Date(sessionData.date);
      }

      const newSession = await storage.createMarketSession(sessionData);
      res.json(newSession);
    } catch (error) {
      console.error('Create market session error:', error);
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.put("/api/admin/market-sessions/:id", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session?.isAdmin) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Ensure date is a valid Date object if provided
      if (updates.date && typeof updates.date === 'string') {
        updates.date = new Date(updates.date);
      }

      const updatedSession = await storage.updateMarketSession(id, updates);
      if (!updatedSession) {
        return res.status(404).json({ message: "Không tìm thấy phiên chợ" });
      }
      res.json(updatedSession);
    } catch (error) {
      console.error('Update market session error:', error);
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.delete("/api/admin/market-sessions/:id", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session?.isAdmin) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMarketSession(id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy phiên chợ" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Admin routes
  app.get("/api/admin/students", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session?.isAdmin) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    const students = await storage.getAllStudents();
    const studentsWithoutPassword = students.map(s => ({ ...s, password: undefined }));
    res.json(studentsWithoutPassword);
  });

  app.post("/api/admin/transactions", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session?.isAdmin) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.delete("/api/admin/students/:id", async (req: Request, res: Response) => {
    const session = (req as any).session as Session;
    if (!session?.isAdmin) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    const id = parseInt(req.params.id);
    const success = await storage.deleteStudent(id);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
