# Backend Issues Fixed ✅

## Issues Found and Resolved

### 1. Port Conflict (macOS AirPlay)
**Problem**: Port 5000 was being used by macOS AirPlay service, preventing backend from starting properly.

**Solution**: 
- Changed backend port from 5000 to 3001
- Updated `backend/.env`: `PORT=3001`
- Updated `frontend/.env`: `VITE_API_URL=http://localhost:3001/api`

### 2. Invalid Password Hashes
**Problem**: Test users had corrupted bcrypt hashes with repeating patterns (`$2b$10$rKZvVxZ5qXqZ5qXqZ5qXqZ...`), causing all login attempts to fail.

**Solution**:
- Created `backend/scripts/resetTestUsers.js` to properly hash passwords
- Deleted old test users and recreated them with valid bcrypt hashes
- All test users now use password: `password123`

### 3. Missing Diagnostic Tools
**Problem**: No easy way to verify backend configuration and database connection.

**Solution**:
- Created `backend/scripts/diagnose.js` - comprehensive diagnostic script
- Added npm scripts for easy access:
  - `npm run diagnose` - Check backend health
  - `npm run reset-users` - Reset test users

### 4. Error Handling
**Problem**: Backend had minimal error handling and logging.

**Solution**:
- Added 404 handler for unknown routes
- Added global error handler with stack traces in development
- Enhanced startup logging showing all configuration status

## Current Status

### ✅ Backend Running
- **Port**: 3001
- **Status**: Running with nodemon
- **CORS**: Configured for ports 3000, 5173, 8080

### ✅ Database Connected
- **Supabase URL**: Configured
- **Supabase Key**: Anon key (starts with eyJ)
- **JWT Secret**: Configured
- **Tables**: All 10 tables exist

### ✅ Test Users Created
All test users have password: `password123`

| Email | Role | Status |
|-------|------|--------|
| admin@mlrit.ac.in | admin | ✅ Working |
| faculty@mlrit.ac.in | faculty | ✅ Working |
| mentor@mlrit.ac.in | student_mentor | ✅ Working |
| student@mlrit.ac.in | student | ✅ Working |

### ✅ Endpoints Tested
- `POST /api/auth/login` - ✅ Working
- `POST /api/auth/register` - ✅ Working
- `GET /health` - ✅ Working

## How to Use

### Start Backend
```bash
cd backend
npm run dev
```

### Run Diagnostics
```bash
cd backend
npm run diagnose
```

### Reset Test Users
```bash
cd backend
npm run reset-users
```

### Test Login (curl)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mlrit.ac.in","password":"password123"}'
```

### Test Registration (curl)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@mlrit.ac.in","password":"test123","role":"student"}'
```

## Next Steps

1. **Start Frontend**: Make sure frontend is running on port 8080
2. **Test Login**: Try logging in with test credentials
3. **Test Registration**: Try creating a new account
4. **Check CORS**: Verify no CORS errors in browser console

## Files Modified

- `backend/.env` - Changed PORT to 3001
- `backend/index.js` - Added error handling and logging
- `backend/package.json` - Added diagnose and reset-users scripts
- `backend/scripts/diagnose.js` - Created diagnostic script
- `backend/scripts/resetTestUsers.js` - Created user reset script
- `frontend/.env` - Updated API URL to port 3001

## Troubleshooting

### If login still fails:
```bash
cd backend
npm run reset-users
```

### If backend won't start:
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Kill process if needed
kill -9 $(lsof -ti:3001)

# Restart backend
npm run dev
```

### If database connection fails:
```bash
cd backend
npm run diagnose
```

This will check:
- Environment variables
- Required files
- Dependencies
- Supabase connection
- Database tables
- Test users
