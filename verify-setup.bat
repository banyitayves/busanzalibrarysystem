@echo off
REM Smart Library - Setup Verification Checklist for Windows

echo.
echo 🔍 Checking Smart Library Setup...
echo.

REM Check Node/npm
echo ✓ Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do (
        echo   ✅ Node.js installed: %%i
    )
) else (
    echo   ❌ Node.js not found. Install from https://nodejs.org/
)

echo ✓ Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm -v') do (
        echo   ✅ npm installed: %%i
    )
) else (
    echo   ❌ npm not found
)

REM Check MySQL
echo ✓ Checking MySQL installation...
where mysql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   ✅ MySQL installed
) else (
    echo   ⚠️  MySQL not found. Install from https://dev.mysql.com/downloads/
)

REM Check .env.local
echo ✓ Checking .env.local configuration...
if exist .env.local (
    echo   ✅ .env.local exists
    findstr /M "DB_PASSWORD" .env.local >nul
    if %ERRORLEVEL% EQU 0 (
        findstr /M "your_password_here" .env.local >nul
        if %ERRORLEVEL% EQU 0 (
            echo   ⚠️  DB_PASSWORD still set to placeholder. Update it!
        ) else (
            echo   ✅ DB_PASSWORD configured
        )
    ) else (
        echo   ❌ DB_PASSWORD not found in .env.local
    )
) else (
    echo   ❌ .env.local not found. Create from .env.example
)

REM Check key files
echo ✓ Checking key files...
if exist package.json echo   ✅ package.json
if exist next.config.ts echo   ✅ next.config.ts
if exist tsconfig.json echo   ✅ tsconfig.json
if exist app\api\auth\login\route.ts echo   ✅ app\api\auth\login\route.ts
if exist app\api\auth\register\route.ts echo   ✅ app\api\auth\register\route.ts
if exist app\api\init\route.ts echo   ✅ app\api\init\route.ts
if exist app\api\seed\route.ts echo   ✅ app\api\seed\route.ts
if exist lib\db.ts echo   ✅ lib\db.ts
if exist lib\db-init.ts echo   ✅ lib\db-init.ts

echo.
echo 📋 Setup Checklist:
echo   [ ] MySQL server running
echo   [ ] .env.local configured with DB password
echo   [ ] Google Gemini API key added to .env.local
echo   [ ] npm install completed
echo   [ ] npm run dev started
echo   [ ] /api/init visited in browser
echo   [ ] /api/seed visited in browser
echo   [ ] Tested login with student1/password123
echo.
echo 🚀 Quick Start:
echo   1. npm install
echo   2. npm run dev
echo   3. Visit http://localhost:3000/api/init
echo   4. Visit http://localhost:3000/api/seed
echo   5. Go to http://localhost:3000/login
echo.
pause
