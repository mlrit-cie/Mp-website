#!/bin/bash

echo "🚀 Starting MLRIT Project Hub Backend..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Kill any existing process on port 5000
echo "🔍 Checking for existing processes on port 5000..."
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "⚠️  Found existing process on port 5000. Killing it..."
    lsof -ti:5000 | xargs kill -9
    sleep 1
    echo "✅ Killed existing process"
fi

# Navigate to backend
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in backend directory"
    echo "Please create backend/.env with your Supabase credentials"
    exit 1
fi

echo ""
echo "✅ Starting backend server..."
echo "📍 Backend will run on: http://localhost:5000"
echo "🔗 Health check: http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the server
npm run dev
