#!/bin/bash

echo "🔄 Restarting Backend with CORS Fix..."
echo ""

# Kill existing backend process
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "🔴 Stopping existing backend on port 5000..."
    lsof -ti:5000 | xargs kill -9
    sleep 1
    echo "   ✅ Stopped"
else
    echo "✅ Port 5000 is free"
fi

echo ""
echo "🚀 Starting backend with updated CORS configuration..."
echo ""

cd backend
npm run dev
