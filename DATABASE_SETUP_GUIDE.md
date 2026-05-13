## 🗄️ Database Setup & Verification Guide

## The Problem

You're getting errors during login/signup because:
1. Database tables might not be created
2. Test users might not exist
3. Passwords might not be properly hashed
4. Supabase connection might be incorrect
5. Row Level Security (RLS) might be blocking queries

## Complete Solution

### Step 1: Verify Supabase Connection

**Check your `backend/.env` file:**
```env
SUPABASE_URL=https://fwovtfyqxqqtbyzgffdn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY_HERE
JWT_SECRET=39359edc125423f1fee7f3b0f719c1ba8c317263e445808628bcf065d6189947e5b47a9b86d81d54a056f54ae49aeaa71f2ea2179fd34910bc53df1f531c2634
```

**Get the correct anon key:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the **anon** key (very long, starts with `eyJ`)

### Step 2: Create Database Schema

**In Supabase SQL Editor, run these files in order:**

#### 2.1 Create Tables
```sql
-- Run: backend/database/supabase_schema.sql
```
This creates all tables including the `users` table.

#### 2.2 Setup Authentication
```sql
-- Run: backend/database/auth_setup.sql
```
This:
- Verifies users table exists
- Creates test users with proper password hashing
- Disables RLS for testing
- Grants necessary permissions

#### 2.3 Verify Setup
```sql
-- Run: backend/database/verify_and_setup.sql
```
This shows you:
- All tables that exist
- Current users
- Password hash status
- Any issues

### Step 3: What Each SQL File Does

| File | Purpose | When to Use |
|------|---------|-------------|
| `supabase_schema.sql` | Creates all tables | First time setup |
| `auth_setup.sql` | Sets up authentication | If login/signup fails |
| `verify_and_setup.sql` | Checks everything | To diagnose issues |
| `sample_data.sql` | Adds sample data | Optional - for testing |
| `sample_data_safe.sql` | Adds data without deleting | If you have existing data |

### Step 4: Run SQL Files in Supabase

**How to run SQL in Supabase:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy content from SQL file
6. Paste into editor
7. Click **Run** or press `Ctrl+Enter`

**Run in this order:**
1. `supabase_schema.sql` (creates tables)
2. `auth_setup.sql` (sets up auth)
3. `verify_and_setup.sql` (verify it worked)

### Step 5: Verify Tables Were Created

After running the SQL files, check in Supabase:

1. Go to **Table Editor** in left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ sections
   - ✅ teams
   - ✅ projects
   - ✅ announcements
   - ✅ attendance
   - ✅ submissions
   - ✅ team_members
   - ✅ mentor_assignments
   - ✅ timetable

3. Click on **users** table
4. You should see 4 test users:
   - admin@mlrit.ac.in
   - faculty@mlrit.ac.in
   - mentor@mlrit.ac.in
   - student@mlrit.ac.in

### Step 6: Test Backend Connection

```bash
# Start backend
cd backend
npm run dev

# In another terminal, test the connection
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
    "id": 4,
    "name": "Student User",
    "email": "student@mlrit.ac.in",
    "role": "student",
    "section_id": 1
  }
}
```

### Step 7: Test Signup

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@mlrit.ac.in",
    "password": "test123",
    "role": "student"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 5,
    "name": "New User",
    "email": "newuser@mlrit.ac.in",
    "role": "student"
  }
}
```

## Common Issues & Solutions

### Issue 1: "Invalid API key"

**Cause:** Wrong SUPABASE_KEY in backend/.env

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the **anon** key (starts with `eyJ`)
3. Update `backend/.env`
4. Restart backend

### Issue 2: "relation 'users' does not exist"

**Cause:** Tables not created

**Solution:**
1. Run `backend/database/supabase_schema.sql` in Supabase SQL Editor
2. Verify tables exist in Table Editor

### Issue 3: "Invalid credentials" (but user exists)

**Cause:** Password not properly hashed

**Solution:**
1. Run `backend/database/auth_setup.sql` in Supabase SQL Editor
2. This will update passwords with proper bcrypt hashes

### Issue 4: "permission denied for table users"

**Cause:** Row Level Security (RLS) blocking access

**Solution:**
Run this in Supabase SQL Editor:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
```

### Issue 5: "User with this email already exists"

**Cause:** Email already registered

**Solution:**
- Use a different email, OR
- Login with existing credentials, OR
- Delete the user in Supabase Table Editor

## Database Schema Overview

### Users Table (for Login/Signup)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    section_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Auto-incrementing user ID
- `name` - Full name
- `email` - Unique email (used for login)
- `password` - Bcrypt hashed password
- `role` - One of: admin, faculty, student_mentor, student
- `section_id` - Optional section reference
- `created_at` - Timestamp

**Indexes:**
- `idx_users_email` - Fast email lookups
- `idx_users_role` - Fast role filtering

## Test Credentials

After running `auth_setup.sql`, you'll have these test users:

| Email | Password | Role |
|-------|----------|------|
| admin@mlrit.ac.in | password123 | admin |
| faculty@mlrit.ac.in | password123 | faculty |
| mentor@mlrit.ac.in | password123 | student_mentor |
| student@mlrit.ac.in | password123 | student |

## Verification Checklist

- [ ] Supabase project created
- [ ] SUPABASE_URL in backend/.env is correct
- [ ] SUPABASE_KEY in backend/.env is the anon key (starts with `eyJ`)
- [ ] Ran `supabase_schema.sql` in Supabase SQL Editor
- [ ] Ran `auth_setup.sql` in Supabase SQL Editor
- [ ] Can see `users` table in Supabase Table Editor
- [ ] Can see 4 test users in users table
- [ ] Backend running on port 5000
- [ ] Can curl the login endpoint successfully
- [ ] Can curl the register endpoint successfully
- [ ] Frontend can login successfully
- [ ] Frontend can signup successfully

## Quick Commands

```bash
# Kill all ports
./kill-ports.sh

# Start backend
cd backend
npm run dev

# Test connection
./test-connection.sh

# Start frontend
cd frontend
npm run dev

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@mlrit.ac.in","password":"password123"}'
```

## Summary

Your database needs:
1. ✅ Tables created (run `supabase_schema.sql`)
2. ✅ Test users with hashed passwords (run `auth_setup.sql`)
3. ✅ RLS disabled for testing
4. ✅ Correct Supabase anon key in backend/.env

Once all these are done, login and signup will work! 🎉
