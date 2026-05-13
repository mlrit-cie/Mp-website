# 🚀 MLRIT Project Hub - Quick Start Guide

## ✅ Current Status

Your project is **fully configured and ready to use**!

- ✅ Backend running on port 3001
- ✅ Database connected to Supabase
- ✅ Test users created with valid passwords
- ✅ Authentication endpoints working
- ✅ CORS configured for frontend

## 🔑 Test Credentials

All test users use the same password: **`password123`**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mlrit.ac.in | password123 |
| Faculty | faculty@mlrit.ac.in | password123 |
| Mentor | mentor@mlrit.ac.in | password123 |
| Student | student@mlrit.ac.in | password123 |

## 🏃 How to Run

### 1. Start Backend (if not running)
```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 3001
CORS enabled for: http://localhost:3000, http://localhost:5173, http://localhost:8080
Supabase URL: ✓ Configured
Supabase Key: ✓ Configured
JWT Secret: ✓ Configured
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

The frontend should start on port 8080 (or another available port).

### 3. Open Browser
Navigate to the frontend URL (usually `http://localhost:8080`)

### 4. Login
- Click "Get Started" or "Login"
- Enter any test user credentials (see table above)
- You'll be redirected to the appropriate dashboard based on your role

## 🧪 Testing

### Test Login via Browser
1. Go to `http://localhost:8080/login`
2. Enter: `admin@mlrit.ac.in` / `password123`
3. Should redirect to Admin Dashboard

### Test Registration
1. Go to `http://localhost:8080/signup`
2. Fill in the form with a new email
3. Select a role or let it auto-detect from email
4. Should create account and log you in

### Test via Command Line
```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mlrit.ac.in","password":"password123"}'

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@mlrit.ac.in","password":"test123"}'
```

## 🛠️ Useful Commands

### Backend Diagnostics
Check if everything is configured correctly:
```bash
cd backend
npm run diagnose
```

### Reset Test Users
If login stops working, reset the test users:
```bash
cd backend
npm run reset-users
```

### Check Backend Health
```bash
curl http://localhost:3001/health
```

## 📁 Project Structure

```
mlrit-project-hub/
├── backend/
│   ├── .env                          # Environment variables (PORT=3001)
│   ├── index.js                      # Main server file
│   ├── database/                     # SQL files
│   ├── scripts/
│   │   ├── diagnose.js              # Health check script
│   │   └── resetTestUsers.js        # Reset test users
│   └── src/
│       ├── config/supabase.js       # Supabase client
│       ├── controllers/             # Business logic
│       ├── models/                  # Database models
│       ├── routes/                  # API routes
│       └── middleware/              # Auth & RBAC
│
└── frontend/
    ├── .env                         # Frontend config (API_URL)
    ├── src/
    │   ├── pages/
    │   │   ├── Login.tsx           # Unified login page
    │   │   └── SignUp.tsx          # Registration page
    │   ├── contexts/
    │   │   └── AuthContext.tsx     # Authentication state
    │   └── components/
    │       └── dashboards/         # Role-based dashboards
    └── ...
```

## 🔧 Configuration Files

### Backend Environment (backend/.env)
```env
PORT=3001
SUPABASE_URL=https://fwovtfyqxqqtbyzgffdn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=39359edc125423f1fee7f3b0f719c1ba...
NODE_ENV=development
```

### Frontend Environment (frontend/.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)

# Restart
cd backend && npm run dev
```

### Login fails with "Invalid credentials"
```bash
# Reset test users
cd backend
npm run reset-users
```

### CORS errors in browser
- Make sure backend is running on port 3001
- Make sure frontend .env has `VITE_API_URL=http://localhost:3001/api`
- Restart both frontend and backend

### Database connection fails
```bash
# Run diagnostics
cd backend
npm run diagnose
```

Check that:
- SUPABASE_URL is correct
- SUPABASE_KEY is the anon key (starts with `eyJ`)
- Internet connection is working

## 📚 Documentation

- `BACKEND_FIXED.md` - Details of backend fixes
- `AUTHENTICATION_FIX.md` - Authentication system details
- `UNIFIED_LOGIN.md` - Unified login page details
- `SIGNUP_FEATURE.md` - Registration feature details
- `DATABASE_SETUP_GUIDE.md` - Database setup instructions
- `CONNECTION_STATUS.md` - Database connection status

## 🎯 Next Steps

1. **Customize Dashboards**: Edit files in `frontend/src/components/dashboards/`
2. **Add Features**: Create new routes and controllers
3. **Style Updates**: Modify Tailwind classes in components
4. **Database Changes**: Add migrations in `backend/database/`
5. **Deploy**: Set up production environment variables

## 💡 Tips

- Use `npm run diagnose` regularly to check backend health
- Keep test users for development, create real users for production
- Check browser console for frontend errors
- Check terminal for backend errors
- Use the unified login page at `/login` (not role-specific pages)

## 🆘 Need Help?

1. Run diagnostics: `cd backend && npm run diagnose`
2. Check backend logs in the terminal
3. Check browser console for frontend errors
4. Verify environment variables in `.env` files
5. Make sure both backend and frontend are running

---

**Everything is working! You can now start developing your features.** 🎉
