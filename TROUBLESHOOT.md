# 🔧 Troubleshooting "Invalid Credentials" Error

## Quick Fix Steps

### Step 1: Start Backend Server

```bash
# Open a new terminal
cd backend
npm run dev
```

**Expected output:**
```
Server is running on port 5000
```

If you see an error about port already in use:
```bash
# Kill the process on port 5000
lsof -ti:5000 | xargs kill -9

# Then start again
npm run dev
```

### Step 2: Create Test Users

**Open a NEW terminal** (keep backend running):
```bash
cd backend
node scripts/createTestUsers.js
```

**Expected output:**
```
Creating test users...

✓ Created: admin@mlrit.ac.in (admin)
✓ Created: faculty@mlrit.ac.in (faculty)
✓ Created: mentor@mlrit.ac.in (mentor)
✓ Created: student@mlrit.ac.in (student)

✅ Test users setup complete!

📝 Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin:   admin@mlrit.ac.in / password123
Faculty: faculty@mlrit.ac.in / password123
Mentor:  mentor@mlrit.ac.in / password123
Student: student@mlrit.ac.in / password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Test Backend API

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@mlrit.ac.in","password":"password123"}'
```

**Expected response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "Student User",
    "email": "student@mlrit.ac.in",
    "role": "student",
    "section_id": 1
  }
}
```

### Step 4: Start Frontend

**Open a NEW terminal** (keep backend running):
```bash
cd frontend
npm run dev
```

### Step 5: Test Login

1. Open http://localhost:5173
2. Click "Login"
3. Enter: `student@mlrit.ac.in` / `password123`
4. Should redirect to Student Dashboard

---

## Common Issues & Solutions

### Issue 1: "Backend not running"

**Symptoms:**
- "Invalid credentials" error
- Network error in browser console
- `curl http://localhost:5000/health` fails

**Solution:**
```bash
cd backend
npm install  # Make sure dependencies are installed
npm run dev
```

### Issue 2: "Port 5000 already in use"

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill the process
lsof -ti:5000 | xargs kill -9

# Start backend again
npm run dev
```

### Issue 3: "Supabase connection error"

**Symptoms:**
- Backend starts but login fails
- Error in backend console about Supabase

**Solution:**
Check your `backend/.env` file:
```bash
cat backend/.env
```

Should have:
```env
SUPABASE_URL=https://wxeekxgdxxokuhdhvivj.supabase.co
SUPABASE_KEY=sb_publishable_IX8LIXKXV_TCPciFwUtqfg_ewDkBhNJ
JWT_SECRET=39359edc125423f1fee7f3b0f719c1ba8c317263e445808628bcf065d6189947e5b47a9b86d81d54a056f54ae49aeaa71f2ea2179fd34910bc53df1f531c2634
```

### Issue 4: "Test users not created"

**Symptoms:**
- Backend running
- Still getting "Invalid credentials"

**Solution:**
```bash
cd backend
node scripts/createTestUsers.js
```

If you get an error, check:
1. Supabase credentials are correct
2. Database schema is applied
3. Internet connection is working

### Issue 5: "Frontend can't connect to backend"

**Symptoms:**
- Network error in browser console
- CORS error

**Solution:**
Check `frontend/.env`:
```bash
cat frontend/.env
```

Should have:
```env
VITE_API_URL=http://localhost:5000/api
```

If missing, create it:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
```

Then restart frontend:
```bash
cd frontend
npm run dev
```

### Issue 6: "Wrong password hash"

**Symptoms:**
- Backend running
- Users exist in database
- Still "Invalid credentials"

**Solution:**
The sample data has placeholder hashes. Run the test user script:
```bash
cd backend
node scripts/createTestUsers.js
```

This will update passwords to properly hashed `password123`.

---

## Debugging Checklist

- [ ] Backend running on port 5000
- [ ] Can access http://localhost:5000/health
- [ ] Test users created (ran createTestUsers.js)
- [ ] Backend .env file has Supabase credentials
- [ ] Frontend .env file has API URL
- [ ] Frontend running on port 5173
- [ ] Browser console shows no CORS errors
- [ ] Can curl the login endpoint successfully

---

## Manual Testing Commands

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```

### 2. Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mlrit.ac.in","password":"password123"}'
```

### 3. Check Supabase Connection
```bash
cd backend
node -e "
const supabase = require('./src/config/supabase');
supabase.from('users').select('count').then(r => console.log('Connected:', r));
"
```

---

## Still Not Working?

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for errors

Common errors:
- `Failed to fetch` → Backend not running
- `CORS error` → Backend CORS not configured (should be fixed)
- `401 Unauthorized` → Wrong credentials or users not created
- `500 Internal Server Error` → Backend error, check backend console

### Check Backend Console

Look at the terminal where backend is running. You should see:
```
POST /api/auth/login 200 - - 123.456 ms
```

If you see:
```
POST /api/auth/login 401 - - 123.456 ms
```

This means credentials are wrong. Run createTestUsers.js again.

If you see:
```
POST /api/auth/login 500 - - 123.456 ms
```

This means a server error. Check the error message in the console.

---

## Complete Reset

If nothing works, do a complete reset:

```bash
# 1. Kill all processes
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# 2. Backend setup
cd backend
npm install
npm run dev
# Wait for "Server is running on port 5000"

# 3. In NEW terminal - Create users
cd backend
node scripts/createTestUsers.js

# 4. In NEW terminal - Frontend setup
cd frontend
npm install
npm run dev

# 5. Test
# Open http://localhost:5173
# Login with: student@mlrit.ac.in / password123
```

---

## Need More Help?

1. Check backend console for errors
2. Check browser console for errors
3. Verify Supabase credentials
4. Make sure database schema is applied
5. Ensure test users are created with proper password hashes
