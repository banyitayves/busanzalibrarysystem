@echo off
REM Smart Library Setup Script for Windows
REM This script helps set up the Smart Library platform

echo.
echo 🚀 Smart Library Setup Script
echo ==============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%
echo.

REM Check if npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed
echo.

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist "public\uploads" (
    mkdir public\uploads
    if errorlevel 0 (
        echo ✓ Uploads directory created
    ) else (
        echo ⚠️ Could not create uploads directory, please create manually
    )
) else (
    echo ✓ Uploads directory already exists
)

echo.

REM Check for MySQL
echo 🗄️ Checking MySQL...
where mysql >nul 2>nul
if errorlevel 1 (
    echo ⚠️ MySQL is not installed in your PATH
    echo   Download from: https://dev.mysql.com/downloads/mysql/
) else (
    echo ✓ MySQL is installed
)

echo.

REM Check for .env.local
if not exist ".env.local" (
    echo ⚠️ .env.local file not found!
    echo.
    echo Please create .env.local with the following variables:
    echo.
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=your_password
    echo DB_NAME=smart_library
    echo NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    echo.
) else (
    echo ✓ .env.local exists
)

echo.

REM Build the project
echo 🔨 Building the project...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✓ Build successful
echo.

echo ✨ Setup Complete!
echo.
echo Next steps:
echo 1. Update .env.local with your database and API keys
echo 2. Set up your MySQL database:
echo    mysql -u root -p ^< database_schema.sql
echo 3. Start the development server:
echo    npm run dev
echo.
echo Access the application at: http://localhost:3000
echo.
pause
