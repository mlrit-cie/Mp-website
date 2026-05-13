#!/bin/bash

echo "🔍 MLRIT Project Hub - Setup Diagnostic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check backend directory
echo "📁 Checking backend directory..."
if [ -d "backend" ]; then
    echo "   ✅ backend/ exists"
else
    echo "   ❌ backend/ not found"
    exit 1
fi

# Check backend package.json
if [ -f "backend/package.json" ]; then
    echo "   ✅ backend/package.json exists"
else
    echo "   ❌ backend/package.json not found"
fi

# Check backend node_modules
if [ -d "backend/node_modules" ]; then
    echo "   ✅ backend/node_modules exists"
else
    echo "   ⚠️  backend/node_modules not found (run: cd backend && npm install)"
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
    
    # Check for required env vars
    if grep -q "SUPABASE_URL" backend/.env; then
        echo "   ✅ SUPABASE_URL found in .env"
    else
        echo "   ❌ SUPABASE_URL missing in .env"
    fi
    
    if grep -q "SUPABASE_KEY" backend/.env; then
        echo "   ✅ SUPABASE_KEY found in .env"
    else
        echo "   ❌ SUPABASE_KEY missing in .env"
    fi
    
    if grep -q "JWT_SECRET" backend/.env; then
        echo "   ✅ JWT_SECRET found in .env"
    else
        echo "   ❌ JWT_SECRET missing in .env"
    fi
else
    echo "   ❌ backend/.env not found"
fi

echo ""
echo "📁 Checking frontend directory..."
if [ -d "frontend" ]; then
    echo "   ✅ frontend/ exists"
else
    echo "   ❌ frontend/ not found"
    exit 1
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo "   ✅ frontend/.env exists"
    
    if grep -q "VITE_API_URL" frontend/.env; then
        echo "   ✅ VITE_API_URL found in .env"
    else
        echo "   ❌ VITE_API_URL missing in .env"
    fi
else
    echo "   ⚠️  frontend/.env not found (should have VITE_API_URL)"
fi

# Check frontend node_modules
if [ -d "frontend/node_modules" ]; then
    echo "   ✅ frontend/node_modules exists"
else
    echo "   ⚠️  frontend/node_modules not found (run: cd frontend && npm install)"
fi

echo ""
echo "🌐 Checking backend server..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5000"
    RESPONSE=$(curl -s http://localhost:5000/health)
    echo "   📡 Response: $RESPONSE"
else
    echo "   ❌ Backend is NOT running on port 5000"
    echo "   💡 Start it with: ./start-backend.sh"
fi

echo ""
echo "🔌 Checking port 5000..."
if lsof -ti:5000 > /dev/null 2>&1; then
    PID=$(lsof -ti:5000 | head -1)
    echo "   ⚠️  Port 5000 is in use by PID: $PID"
    echo "   💡 Kill it with: lsof -ti:5000 | xargs kill -9"
else
    echo "   ✅ Port 5000 is available"
fi

echo ""
echo "📝 Checking test user script..."
if [ -f "backend/scripts/createTestUsers.js" ]; then
    echo "   ✅ createTestUsers.js exists"
    echo "   💡 Run it with: cd backend && node scripts/createTestUsers.js"
else
    echo "   ❌ createTestUsers.js not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is running - You can test login!"
    echo ""
    echo "🧪 Test login with:"
    echo "   curl -X POST http://localhost:5000/api/auth/login \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"email\":\"student@mlrit.ac.in\",\"password\":\"password123\"}'"
else
    echo "❌ Backend is NOT running"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Start backend: ./start-backend.sh"
    echo "   2. Create test users: cd backend && node scripts/createTestUsers.js"
    echo "   3. Start frontend: cd frontend && npm run dev"
fi

echo ""
