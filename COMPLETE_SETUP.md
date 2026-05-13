# 🚀 Complete Setup Guide - MLRIT Project Hub

## What You Have Now

✅ **Unified Login Page** - One login for all roles  
✅ **Sign Up Page** - Users can create accounts  
✅ **Supabase Integration** - All data stored in cloud database  
✅ **Role-Based Dashboards** - Different views for each role  
✅ **Secure Authentication** - Password hashing + JWT tokens  

## Quick Start (3 Steps)

### Step 1: Fix Supabase Key

Open `backend/.env` and update with your **anon key** from Supabase:

```env
PORT=5000
SUPABASE_URL=https://fwovtfyqxqqtbyzgffdn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY_HERE
JWT_SECRET=39359edc125423f1fee7f3b0f719c1ba8c317263e445808628bcf065d6189947e5b47a9b86d81d54a056f54ae49aeaa71f2ea2179fd34910bc53df1f531c2634
NODE_ENV=development
```

**How to get the anon key:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the **anon** key (very long, starts with `eyJ`)

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

Wait for: `Server is running on port 5000`

### Step 3: Start Frontend

Open a **new terminal**:
```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

## Test Everything

### Test 1: Create Account
1. Visit http://localhost:5173/signup
2. Fill in the form:
   - Name: Your Name
   - Email: yourname@mlrit.ac.in
   - Role: Student
   - Password: test123
3. Click "Create Account"
4. Should redirect to login

### Test 2: Login
1. Visit http://localhost:5173/login
2. Enter your email and password
3. Click "Sign In"
4. Should see Student Dashboard

### Test 3: Connection Test
```bash
./test-connection.sh
```

Should show all ✅ green checkmarks.

## File Structure

```
mlrit-project-hub/
├── backend/
│   ├── .env                          # ⚠️ UPDATE THIS with anon key
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js     # Login + Register
│   │   ├── routes/
│   │   │   └── authRoutes.js         # /login + /register
│   │   └── models/
│   │       └── User.js               # Database operations
│   └── scripts/
│       └── createTestUsers.js        # Create test users
│
├── frontend/
│   ├── .env                          # API URL config
│   └── src/
│       ├── pages/
│       │   ├── Login.tsx             # Unified login
│       │   ├── SignUp.tsx            # NEW - Sign up
│       │   └── Dashboard.tsx         # Role-based routing
│       └── contexts/
│           └── AuthContext.tsx       # Authentication logic
│
└── Documentation/
    ├── COMPLETE_SETUP.md             # This file
    ├── SIGNUP_FEATURE.md             # Sign up details
    ├── UNIFIED_LOGIN.md              # Login details
    ├── FIX_SUPABASE_KEY.md          # How to get Supabase key
    ├── TROUBLESHOOT.md               # Debugging guide
    └── test-connection.sh            # Test script
```

## Routes

### Frontend
- `/` - Landing page
- `/login` - Login page (all roles)
- `/signup` - Sign up page
- `/dashboard` - Role-based dashboard

### Backend API
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Sign up
- `GET /health` - Health check

## User Roles

| Role | Email Pattern | Dashboard |
|------|---------------|-----------|
| Admin | admin@mlrit.ac.in | Red Admin Dashboard |
| Faculty | faculty@mlrit.ac.in | Blue Faculty Dashboard |
| Mentor | mentor@mlrit.ac.in | Green Mentor Dashboard |
| Student | student@mlrit.ac.in | Blue Student Dashboard |

## Troubleshooting

### ❌ "Invalid credentials"
**Cause:** Backend not running or Supabase key wrong  
**Fix:**
1. Check backend is running: `curl http://localhost:5000/health`
2. Update SUPABASE_KEY in `backend/.env` with anon key
3. Restart backend

### ❌ "App crashed"
**Cause:** Error in backend code or config  
**Fix:**
1. Check terminal for error message
2. Make sure SUPABASE_KEY is correct (starts with `eyJ`)
3. Run: `cd backend && npm install`

### ❌ "User already exists"
**Cause:** Email already registered  
**Fix:** Use a different email or login with existing account

### ❌ Can't connect to backend
**Cause:** Backend not running or wrong URL  
**Fix:**
1. Start backend: `cd backend && npm run dev`
2. Check `frontend/.env` has: `VITE_API_URL=http://localhost:5000/api`

## Test Users

If you want pre-made test users:
```bash
cd backend
node scripts/createTestUsers.js
```

This creates:
- admin@mlrit.ac.in / password123
- faculty@mlrit.ac.in / password123
- mentor@mlrit.ac.in / password123
- student@mlrit.ac.in / password123

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] SUPABASE_KEY updated in backend/.env
- [ ] Can access http://localhost:5173
- [ ] Can create account at /signup
- [ ] Can login at /login
- [ ] See correct dashboard based on role
- [ ] Data stored in Supabase

## Next Steps

Once everything works:

1. **Customize the UI** - Update colors, logos, branding
2. **Add more features** - Projects, teams, announcements
3. **Deploy** - Host on Vercel (frontend) + Render (backend)
4. **Add email verification** - Confirm user emails
5. **Add forgot password** - Password reset flow

## Support Files

- **FIX_SUPABASE_KEY.md** - Detailed guide to get Supabase key
- **SIGNUP_FEATURE.md** - Sign up feature documentation
- **UNIFIED_LOGIN.md** - Login system documentation
- **TROUBLESHOOT.md** - Complete troubleshooting guide
- **test-connection.sh** - Automated connection test

## Quick Commands

```bash
# Check setup
./check-setup.sh

# Test connection
./test-connection.sh

# Start backend
cd backend && npm run dev

# Create test users
cd backend && node scripts/createTestUsers.js

# Start frontend
cd frontend && npm run dev
```

## Success Criteria

✅ Backend responds to http://localhost:5000/health  
✅ Can create account at http://localhost:5173/signup  
✅ Can login at http://localhost:5173/login  
✅ Redirected to correct dashboard  
✅ Data visible in Supabase dashboard  

## 🎉 You're Done!

Your MLRIT Project Hub is now fully functional with:
- ✅ User registration
- ✅ User login
- ✅ Role-based access
- ✅ Supabase integration
- ✅ Secure authentication

Happy coding! 🚀
