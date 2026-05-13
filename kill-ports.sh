#!/bin/bash

echo "🔪 Killing processes on common ports..."
echo ""

# Port 5000 (Backend)
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "🔴 Killing process on port 5000 (Backend)..."
    lsof -ti:5000 | xargs kill -9
    echo "   ✅ Port 5000 cleared"
else
    echo "✅ Port 5000 is already free"
fi

# Port 5173 (Frontend - Vite)
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "🔴 Killing process on port 5173 (Frontend)..."
    lsof -ti:5173 | xargs kill -9
    echo "   ✅ Port 5173 cleared"
else
    echo "✅ Port 5173 is already free"
fi

# Port 3000 (Alternative Frontend)
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "🔴 Killing process on port 3000..."
    lsof -ti:3000 | xargs kill -9
    echo "   ✅ Port 3000 cleared"
else
    echo "✅ Port 3000 is already free"
fi

echo ""
echo "✅ All ports cleared!"
echo ""
echo "You can now start your servers:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
