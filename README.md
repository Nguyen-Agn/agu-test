# Chợ Xanh - Vietnamese Waste Recycling Platform

A full-stack web application for a Vietnamese waste recycling program where students can register, track recycling points, participate in market sessions, and exchange waste for rewards.

## 🌟 Features

- **Student Registration & Management**: Complete user registration system
- **Points Tracking**: Real-time points calculation for recycling activities  
- **Market Sessions**: Schedule and manage waste collection events
- **Admin Dashboard**: Comprehensive admin interface for student and session management
- **Real-time Sync**: PostgreSQL database ensures data synchronization across devices
- **Authentication**: Secure session-based authentication system

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
node build.js
npm start
```

### Database Setup
```bash
npm run db:push
```

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Deployment**: Vercel-ready configuration
- **State Management**: TanStack Query for server state

## 📦 Deployment

Ready for deployment on Vercel with optimized build configuration. See `DEPLOYMENT.md` for detailed deployment instructions.

## 🔐 Default Admin

- Username: `admin`
- Password: `NoAdmin123`

## 📁 Project Structure

```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared TypeScript schemas
├── dist/           # Production build output
├── vercel.json     # Vercel deployment config
└── build.js        # Optimized build script
```