#!/bin/bash

echo "🔗 Testing Backend-Supabase Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if backend is running
echo "1️⃣  Checking if backend is running..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5000"
else
    echo "   ❌ Backend is NOT running"
    echo "   💡 Start it with: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Testing Supabase connection..."
cd backend
node -e "
const supabase = require('./src/config/supabase');
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) {
      console.log('   ❌ Supabase connection failed:', error.message);
      process.exit(1);
    }
    console.log('   ✅ Supabase connection successful');
  } catch (err) {
    console.log('   ❌ Error:', err.message);
    process.exit(1);
  }
})();
" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "   💡 Check your SUPABASE_URL and SUPABASE_KEY in backend/.env"
    exit 1
fi

echo ""
echo "3️⃣  Testing registration endpoint..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@mlrit.ac.in",
    "password": "test123",
    "role": "student"
  }')

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Registration endpoint working"
else
    echo "   ❌ Registration endpoint failed"
    echo "   Response: $REGISTER_RESPONSE"
fi

echo ""
echo "4️⃣  Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@mlrit.ac.in",
    "password": "password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Login endpoint working"
    echo "   📝 User role: $(echo $LOGIN_RESPONSE | grep -o '"role":"[^"]*"' | cut -d'"' -f4)"
else
    echo "   ⚠️  Login failed (user might not exist yet)"
    echo "   💡 Run: cd backend && node scripts/createTestUsers.js"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Connection Test Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Make sure backend is running: cd backend && npm run dev"
echo "   2. Create test users: cd backend && node scripts/createTestUsers.js"
echo "   3. Start frontend: cd frontend && npm run dev"
echo "   4. Visit: http://localhost:5173/signup"
echo ""
