#!/bin/bash
# Smart Library - Setup Verification Checklist

echo "🔍 Checking Smart Library Setup..."
echo ""

# Check Node/npm
echo "✓ Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "  ✅ Node.js installed: $(node -v)"
else
    echo "  ❌ Node.js not found. Install from https://nodejs.org/"
fi

# Check npm
echo "✓ Checking npm installation..."
if command -v npm &> /dev/null; then
    echo "  ✅ npm installed: $(npm -v)"
else
    echo "  ❌ npm not found"
fi

# Check MySQL
echo "✓ Checking MySQL installation..."
if command -v mysql &> /dev/null; then
    echo "  ✅ MySQL installed"
else
    echo "  ⚠️  MySQL not found. Install from https://dev.mysql.com/downloads/"
fi

# Check .env.local
echo "✓ Checking .env.local configuration..."
if [ -f .env.local ]; then
    echo "  ✅ .env.local exists"
    if grep -q "DB_PASSWORD=" .env.local; then
        if grep -q "your_password_here" .env.local; then
            echo "  ⚠️  DB_PASSWORD still set to placeholder. Update it!"
        else
            echo "  ✅ DB_PASSWORD configured"
        fi
    else
        echo "  ❌ DB_PASSWORD not found in .env.local"
    fi
else
    echo "  ❌ .env.local not found. Create from .env.example"
fi

# Check files
echo "✓ Checking key files..."
files=(
    "package.json"
    "next.config.ts"
    "tsconfig.json"
    "app/api/auth/login/route.ts"
    "app/api/auth/register/route.ts"
    "app/api/init/route.ts"
    "app/api/seed/route.ts"
    "lib/db.ts"
    "lib/db-init.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file missing"
    fi
done

echo ""
echo "📋 Setup Checklist:"
echo "  [ ] MySQL server running"
echo "  [ ] .env.local configured with DB password"
echo "  [ ] Google Gemini API key added to .env.local"
echo "  [ ] npm install completed"
echo "  [ ] npm run dev started"
echo "  [ ] /api/init visited in browser"
echo "  [ ] /api/seed visited in browser"
echo "  [ ] Tested login with student1/password123"
echo ""
echo "🚀 Quick Start:"
echo "  1. npm install"
echo "  2. npm run dev"
echo "  3. Visit http://localhost:3000/api/init"
echo "  4. Visit http://localhost:3000/api/seed"
echo "  5. Go to http://localhost:3000/login"
echo ""
