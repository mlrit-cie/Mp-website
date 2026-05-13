# 🚨 QUICK FIX - Login/Signup Not Working

## Do This Right Now (5 Minutes)

### Step 1: Fix Supabase Key (2 min)

1. Open `backend/.env`
2. Go to https://supabase.com/dashboard → Your Project → Settings → API
3. Copy the **anon** key (long key starting with `eyJ`)
4. Replace `SUPABASE_KEY` in `backend/.env` with this key

### Step 2: Setup Database (2 min)

1. Go to https://supabase.com/dashboard → Your Project → SQL Editor
2. Click "New Query"
3. Copy ALL content from `backend/database/auth_setup.sql`
4. Paste and click "Run"
5. You should see "AUTHENTICATION SETUP COMPLETE"

### Step 3: Start Servers (1 min)

```bash
# Terminal 1
./kill-ports.sh
cd backend
npm run dev

# Terminal 2
cd frontend  
npm run dev
```

### Step 4: Test

Visit: http://localhost:5173/login

Try logging in with:
- Email: `student@mlrit.ac.in`
- Password: `password123`

## Still Not Working?

Run this command and send me the output:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@mlrit.ac.in","password":"password123"}'
```

## What Each File Does

| File | What It Does |
|------|--------------|
| `backend/database/supabase_schema.sql` | Creates all tables |
| `backend/database/auth_setup.sql` | **RUN THIS** - Sets up login/signup |
| `backend/database/verify_and_setup.sql` | Checks if everything is correct |
| `DATABASE_SETUP_GUIDE.md` | Full explanation |

## The Most Common Issue

**Problem:** Wrong Supabase key in `backend/.env`

**Your key should:**
- ✅ Start with `eyJ`
- ✅ Be 200+ characters long
- ✅ Come from Supabase Dashboard → Settings → API → anon key

**Your key should NOT:**
- ❌ Start with `ssb_publishable_`
- ❌ Be short (less than 100 characters)
- ❌ Be the service_role key (unless you know what you're doing)

## Quick Test

```bash
# Test if backend is running
curl http://localhost:5000/health

# Test if Supabase connection works
cd backend
node -e "const s=require('./src/config/supabase');s.from('users').select('count').then(r=>console.log('✅ Connected:',r))"
```

## Need More Help?

Read: `DATABASE_SETUP_GUIDE.md` for complete instructions
