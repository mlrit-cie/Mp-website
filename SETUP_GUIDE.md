# Complete Setup Guide - MLRIT Project Hub

## Prerequisites
- Node.js installed
- Supabase account and project created
- Database schema already applied

## Step-by-Step Setup

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Your `backend/.env` file should have:
```env
PORT=5000
SUPABASE_URL=https://wxeekxgdxxokuhdhvivj.supabase.co
SUPABASE_KEY=sb_publishable_IX8LIXKXV_TCPciFwUtqfg_ewDkBhNJ
JWT_SECRET=39359edc125423f1fee7f3b0f719c1ba8c317263e445808628bcf065d6189947e5b47a9b86d81d54a056f54ae49aeaa71f2ea2179fd34910bc53df1f531c2634
NODE_ENV=development
```

#### Start Backend Server
```bash
npm run dev
# or
npm start
```

You should see:
```
Server is running on port 5000
```

#### Test Backend
Open a new terminal and run:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"OK","message":"ProjectSphere Backend is running"}
```

### 2. Database Setup

#### Apply Schema
1. Go to Supabase Dashboard → SQL Editor
2. Run `backend/database/supabase_schema.sql`

#### Add Sample Data
1. In Supabase SQL Editor
2. Run `backend/database/sample_data_safe.sql` (if you have existing data)
   OR
3. Run `backend/database/sample_data.sql` (for fresh start - deletes existing data)

### 3. Create Test Users with Proper Passwords

Since the sample data has placeholder hashed passwords, you need to create users with real passwords. Run this SQL in Supabase:

```sql
-- Delete existing users if needed
DELETE FROM users WHERE email IN ('admin@mlrit.ac.in', 'student@mlrit.ac.in', 'faculty@mlrit.ac.in', 'mentor@mlrit.ac.in');

-- Insert test users with password: 'password123'
-- Note: You'll need to hash these passwords using bcrypt in your backend
```

**Better approach:** Create a seed script (see below)

### 4. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Start Frontend
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 5. Create Test Users (Backend Script)

Create `backend/scripts/createTestUsers.js`:

```javascript
const bcrypt = require('bcryptjs');
const supabase = require('../src/config/supabase');
require('dotenv').config();

async function createTestUsers() {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const users = [
    { name: 'Admin User', email: 'admin@mlrit.ac.in', role: 'admin', section_id: null },
    { name: 'Faculty User', email: 'faculty@mlrit.ac.in', role: 'faculty', section_id: 1 },
    { name: 'Mentor User', email: 'mentor@mlrit.ac.in', role: 'student_mentor', section_id: 1 },
    { name: 'Student User', email: 'student@mlrit.ac.in', role: 'student', section_id: 1 },
  ];

  for (const user of users) {
    const { data, error } = await supabase
      .from('users')
      .upsert([{ ...user, password: hashedPassword }], { onConflict: 'email' })
      .select();

    if (error) {
      console.error(`Error creating ${user.email}:`, error);
    } else {
      console.log(`✓ Created/Updated: ${user.email} (${user.role})`);
    }
  }

  console.log('\n✓ Test users created successfully!');
  console.log('Password for all users: password123\n');
}

createTestUsers().catch(console.error);
```

Run it:
```bash
cd backend
node scripts/createTestUsers.js
```

### 6. Test Login

#### Test Credentials
- **Admin**: admin@mlrit.ac.in / password123
- **Faculty**: faculty@mlrit.ac.in / password123
- **Mentor**: mentor@mlrit.ac.in / password123
- **Student**: student@mlrit.ac.in / password123

#### Test Flow
1. Open http://localhost:5173
2. Click on any login type (Admin, Faculty, Mentor, Student)
3. Enter the test credentials
4. You should be redirected to the appropriate dashboard

### 7. Troubleshooting

#### "Invalid credentials" error
- Check if backend is running: `curl http://localhost:5000/health`
- Check browser console for API errors
- Verify Supabase credentials in `backend/.env`
- Ensure test users are created with proper hashed passwords

#### Backend not starting
- Check if port 5000 is already in use
- Verify all dependencies are installed: `npm install`
- Check for errors in terminal

#### Frontend can't connect to backend
- Verify `VITE_API_URL` in `frontend/.env`
- Check CORS is enabled in backend (already configured)
- Check browser console for network errors

#### Still redirecting to admin
- Clear browser localStorage: `localStorage.clear()`
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check that you're using the updated AuthContext

### 8. Verify Everything Works

Run these checks:

```bash
# 1. Backend health check
curl http://localhost:5000/health

# 2. Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@mlrit.ac.in","password":"password123"}'

# Expected response:
# {"success":true,"token":"...","user":{...}}
```

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Terminal 3 - Create test users (first time only)
cd backend
node scripts/createTestUsers.js
```

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Test users created
4. ✅ Login working with correct role routing
5. 🎉 Start building features!
