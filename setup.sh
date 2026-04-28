#!/bin/bash

# Smart Library Setup Script
# This script helps set up the Smart Library platform

echo "🚀 Smart Library Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✓ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads

if [ $? -eq 0 ]; then
    echo "✓ Uploads directory created"
else
    echo "⚠️ Could not create uploads directory, please create manually: mkdir -p public/uploads"
fi

echo ""

# Check for MySQL
echo "🗄️  Checking MySQL..."
if command -v mysql &> /dev/null; then
    echo "✓ MySQL is installed"
else
    echo "⚠️  MySQL is not installed. Please install MySQL Server first."
    echo "   Download from: https://dev.mysql.com/downloads/mysql/"
fi

echo ""

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found!"
    echo ""
    echo "Please create .env.local with the following variables:"
    echo ""
    echo "DB_HOST=localhost"
    echo "DB_USER=root"
    echo "DB_PASSWORD=your_password"
    echo "DB_NAME=smart_library"
    echo "OPENAI_API_KEY=your_openai_key"
    echo ""
else
    echo "✓ .env.local exists"
fi

echo ""

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your database and API keys"
echo "2. Set up your MySQL database:"
echo "   mysql -u root -p < database_schema.sql"
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
