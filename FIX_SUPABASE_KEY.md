# 🔑 Fix Supabase API Key

## The Problem

Your Supabase API key is invalid. The current key in `backend/.env` is:
```
SUPABASE_KEY=ssb_publishable_SJkReLDEcrRZ4h7NTOt09Q_QiVDt-Yu
```

This format (`ssb_publishable_...`) is not the correct format for Supabase keys.

## How to Get the Correct Key

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **fwovtfyqxqqtbyzgffdn**

### Step 2: Navigate to API Settings

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu

### Step 3: Copy the Correct Keys

You'll see two keys:

#### Option 1: Use the `anon` key (Recommended)
- Look for **Project API keys** section
- Find the key labeled **`anon` `public`**
- It will look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long)
- Click the copy icon

#### Option 2: Use the `service_role` key (More permissions)
- Look for **Project API keys** section  
- Find the key labeled **`service_role` `secret`**
- ⚠️ **Warning:** This key has admin access - keep it secret!
- It will also look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long)

### Step 4: Update Your .env File

Open `backend/.env` and replace the SUPABASE_KEY:

```env
PORT=5000
SUPABASE_URL=https://fwovtfyqxqqtbyzgffdn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE
JWT_SECRET=39359edc125423f1fee7f3b0f719c1ba8c317263e445808628bcf065d6189947e5b47a9b86d81d54a056f54ae49aeaa71f2ea2179fd34910bc53df1f531c2634
NODE_ENV=development
```

**Important:** The key should be very long (200+ characters) and start with `eyJ`.

### Step 5: Restart Backend

After updating the key:

```bash
# Kill the current backend process
lsof -ti:5000 | xargs kill -9

# Start it again
./start-backend.sh
```

Or if you're running it manually:
```bash
# Press Ctrl+C in the terminal where backend is running
# Then start again
cd backend
npm run dev
```

### Step 6: Create Test Users Again

```bash
cd backend
node scripts/createTestUsers.js
```

You should now see:
```
✓ Created: admin@mlrit.ac.in (admin)
✓ Created: faculty@mlrit.ac.in (faculty)
✓ Created: mentor@mlrit.ac.in (mentor)
✓ Created: student@mlrit.ac.in (student)
```

### Step 7: Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@mlrit.ac.in","password":"password123"}'
```

Should return:
```json
{
  "success": true,
  "token": "...",
  "user": {...}
}
```

## Visual Guide

```
Supabase Dashboard
    ↓
Settings (⚙️)
    ↓
API
    ↓
Project API keys
    ↓
┌─────────────────────────────────────┐
│ anon (public)                       │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC... │  ← Copy this!
│ [Copy] [Show]                       │
└─────────────────────────────────────┘
```

## Common Mistakes

❌ **Wrong:** `ssb_publishable_...` (This is not a valid Supabase key format)  
❌ **Wrong:** Short keys (less than 100 characters)  
❌ **Wrong:** Keys from other services  

✅ **Correct:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (200+ characters)  
✅ **Correct:** Starts with `eyJ`  
✅ **Correct:** From Supabase Dashboard → Settings → API  

## Still Having Issues?

### Check if the key is correct:
```bash
# Test Supabase connection
curl https://fwovtfyqxqqtbyzgffdn.supabase.co/rest/v1/ \
  -H "apikey: YOUR_KEY_HERE" \
  -H "Authorization: Bearer YOUR_KEY_HERE"
```

If you get a response (even an error about missing table), the key is valid.

If you get "Invalid API key", the key is wrong.

### Double-check your project URL:
Your project URL is: `https://fwovtfyqxqqtbyzgffdn.supabase.co`

Make sure this matches your actual Supabase project.

## Summary

1. ✅ Go to Supabase Dashboard
2. ✅ Settings → API
3. ✅ Copy the `anon` key (starts with `eyJ`)
4. ✅ Update `backend/.env`
5. ✅ Restart backend
6. ✅ Run `node scripts/createTestUsers.js`
7. ✅ Test login!
