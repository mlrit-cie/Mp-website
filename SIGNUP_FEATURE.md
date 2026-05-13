# 📝 Sign Up Feature - Complete Guide

## What's New

✅ **Sign Up Page** - Users can create their own accounts  
✅ **Role Selection** - Choose between Student, Mentor, Faculty, or Admin  
✅ **Supabase Integration** - All data stored in Supabase database  
✅ **Password Hashing** - Secure bcrypt password encryption  
✅ **Email Validation** - Proper email format checking  
✅ **Auto Role Detection** - Role detected from email if not specified  

## Features

### Sign Up Form Fields
- **Full Name** (required)
- **Email Address** (required, must be valid format)
- **Role** (dropdown: Student, Student Mentor, Faculty, Admin)
- **Password** (required, minimum 6 characters)
- **Confirm Password** (must match password)

### Validation
- ✅ All required fields must be filled
- ✅ Email must be valid format
- ✅ Password must be at least 6 characters
- ✅ Passwords must match
- ✅ Email must be unique (no duplicates)

### Security
- ✅ Passwords are hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens generated on successful registration
- ✅ Secure password visibility toggle

## How to Use

### For Users

1. **Visit the sign-up page:**
   ```
   http://localhost:5173/signup
   ```

2. **Fill in the form:**
   - Enter your full name
   - Enter your MLRIT email
   - Select your role
   - Create a password (min 6 characters)
   - Confirm your password

3. **Click "Create Account"**

4. **You'll be redirected to login** - Use your new credentials to sign in!

### For Developers

#### Backend Endpoint

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@mlrit.ac.in",
  "password": "securepassword123",
  "role": "student",
  "section_id": 1
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@mlrit.ac.in",
    "role": "student",
    "section_id": 1
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

## Testing the Connection

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

### Step 2: Run Connection Test
```bash
./test-connection.sh
```

This will test:
- ✅ Backend health
- ✅ Supabase connection
- ✅ Registration endpoint
- ✅ Login endpoint

### Step 3: Manual Test

**Test Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@mlrit.ac.in",
    "password": "test123",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "...",
  "user": {...}
}
```

## File Structure

### Backend Files
```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js      # Added register function
│   ├── routes/
│   │   └── authRoutes.js          # Added /register route
│   └── models/
│       └── User.js                # Already has create method
└── scripts/
    └── createTestUsers.js         # For creating test users
```

### Frontend Files
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx              # Updated with Sign Up link
│   │   └── SignUp.tsx             # NEW - Sign up page
│   └── App.tsx                    # Added /signup route
```

## Auto Role Detection

If role is not specified, it's detected from email:

| Email Contains | Assigned Role |
|----------------|---------------|
| `admin` | admin |
| `faculty` | faculty |
| `mentor` | student_mentor |
| (default) | student |

Examples:
- `admin@mlrit.ac.in` → admin
- `faculty.john@mlrit.ac.in` → faculty
- `mentor.jane@mlrit.ac.in` → student_mentor
- `student@mlrit.ac.in` → student

## Routes

### Frontend Routes
- `/signup` - Sign up page
- `/login` - Login page
- `/dashboard` - Dashboard (after login)

### Backend Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

## Troubleshooting

### Issue: "User with this email already exists"
**Solution:** The email is already registered. Try logging in or use a different email.

### Issue: "Invalid email format"
**Solution:** Make sure the email is in proper format: `name@domain.com`

### Issue: "Password must be at least 6 characters long"
**Solution:** Use a longer password (minimum 6 characters).

### Issue: "Passwords do not match"
**Solution:** Make sure both password fields have the same value.

### Issue: Backend not responding
**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/health

# If not, start it
cd backend
npm run dev
```

### Issue: Supabase connection error
**Solution:** Check your `backend/.env` file:
- SUPABASE_URL should be correct
- SUPABASE_KEY should be the anon key (starts with `eyJ`)

## Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt
- JWT token authentication
- Email validation
- Password length requirements
- Unique email constraint

🔒 **Recommended for Production:**
- Email verification
- CAPTCHA on sign-up
- Rate limiting
- Password strength meter
- Two-factor authentication

## Complete Setup Checklist

- [ ] Backend running on port 5000
- [ ] Supabase credentials in `backend/.env`
- [ ] Database schema applied
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173/signup
- [ ] Can create a new account
- [ ] Can login with new account
- [ ] Redirected to correct dashboard based on role

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Test Connection
./test-connection.sh

# Terminal 3 - Frontend
cd frontend
npm run dev

# Open browser
# Visit: http://localhost:5173/signup
```

## Success!

Once everything is set up:
1. ✅ Users can create accounts at `/signup`
2. ✅ Data is stored in Supabase
3. ✅ Users can login at `/login`
4. ✅ Correct dashboard shown based on role
5. ✅ Backend and Supabase properly connected

🎉 Your sign-up feature is ready!
