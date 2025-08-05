// Vercel serverless function entry point
import express from 'express';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import schema from './schema.js';

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for production
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://cho-xanh.vercel.app',
    'http://localhost:5000',
    'https://localhost:5000'
  ];
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Session-ID');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Database setup
let db;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

// Global session storage (will be reset on each cold start)
const sessions = new Map();

// Session middleware
function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  
  req.session = session;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.isAdmin) {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
}

// Routes
app.get('/api/me', requireAuth, (req, res) => {
  if (req.session.isAdmin) {
    res.json({ isAdmin: true });
  } else {
    res.json({ student: req.session.student });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (identifier === 'admin' && password === 'NoAdmin123') {
      const sessionId = Math.random().toString(36).substring(7) + Date.now().toString(36);
      sessions.set(sessionId, { isAdmin: true });
      return res.json({ isAdmin: true, sessionId });
    }
    
    if (!db) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    // Find student by studentId or email
    const [student] = await db.select()
      .from(schema.students)
      .where(eq(schema.students.studentId, identifier))
      .limit(1);
    
    if (!student || student.password !== password) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không đúng' });
    }
    
    const sessionId = Math.random().toString(36).substring(7) + Date.now().toString(36);
    sessions.set(sessionId, { student, isAdmin: false });
    
    res.json({ 
      student: {
        id: student.id,
        fullName: student.fullName,
        studentId: student.studentId,
        email: student.email,
        totalPoints: student.totalPoints
      }, 
      sessionId 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ success: true });
});

app.get('/api/admin/students', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    const students = await db.select({
      id: schema.students.id,
      fullName: schema.students.fullName,
      studentId: schema.students.studentId,
      email: schema.students.email,
      major: schema.students.major,
      phone: schema.students.phone,
      totalPoints: schema.students.totalPoints
    }).from(schema.students);
    
    res.json(students);
    
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.get('/api/market-sessions', async (req, res) => {
  try {
    if (!db) {
      return res.json([]);
    }
    
    const sessions = await db.select().from(schema.marketSessions);
    res.json(sessions);
  } catch (error) {
    console.error('Fetch market sessions error:', error);
    res.json([]);
  }
});

app.get('/api/upcoming-session', async (req, res) => {
  try {
    if (!db) {
      return res.json(null);
    }
    
    const [upcoming] = await db.select()
      .from(schema.marketSessions)
      .where(eq(schema.marketSessions.date, new Date(Date.now() + 24 * 60 * 60 * 1000))) // Next 24 hours
      .limit(1);
    
    res.json(upcoming || null);
  } catch (error) {
    console.error('Fetch upcoming session error:', error);
    res.json(null);
  }
});

// Catch all for unmatched routes
app.all('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Export for Vercel
export default app;