# 🎓 MLRIT Project Hub - Frontend-Only Setup

A modern project management system for MLRIT students, faculty, and mentors. Now running entirely on frontend with direct Supabase integration!

## ✨ Architecture

```
Frontend (React + Vite) → Supabase Database
                       ↗ (Direct connection)
```

**No backend server needed!** 🎉

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:8081/` (or next available port)


## 🏗️ Project Structure

```
mlrit-project-hub/
├── .kiro/
│   └── settings/mcp.json         # Supabase MCP connection
├── frontend/
│   ├── .env                      # Supabase credentials
│   ├── src/
│   │   ├── lib/supabase.ts      # Supabase client
│   │   ├── contexts/            # React contexts
│   │   ├── components/          # UI components
│   │   ├── pages/               # Route components
│   │   └── hooks/               # Custom hooks
│   └── package.json
└── README.md
```

## 🔐 Authentication

- **Direct Supabase Integration**: No backend API needed
- **Role-Based Access**: Admin, Faculty, Mentor, Student roles
- **Unified Login**: Single login page for all roles
- **Registration**: Self-service account creation

## 🎯 Features

### For Students
- Project management and tracking
- Team collaboration tools
- Mentor communication
- Progress monitoring

### For Faculty  
- Student oversight
- Project approval workflows
- Academic progress tracking
- Announcement system

### For Mentors
- Student guidance tools
- Project review system
- Progress tracking
- Communication hub

### For Admins
- User management
- System configuration
- Analytics and reporting
- Content management

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom with Supabase
- **State Management**: React Context
- **Routing**: React Router v6

## 📱 Responsive Design

Fully responsive design that works on:
- 📱 Mobile devices
- 📱 Tablets  
- 💻 Desktop computers
- 🖥️ Large screens

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
``

## 📊 Database Schema

The system uses 10 main tables:
- `users` - User accounts and profiles
- `sections` - Academic sections/classes
- `teams` - Student project teams
- `projects` - Project information
- `announcements` - System announcements
- `timetable` - Class schedules
- And more...

## 🚀 Deployment

### Build for Production
```bash
cd frontend
npm run build
```


## 📄 License

This project is licensed under the MIT License.

