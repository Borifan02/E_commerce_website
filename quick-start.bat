@echo off
echo ========================================
echo E-Commerce Platform - Quick Start
echo ========================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
echo.

echo [2/5] Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)
cd ..
echo.

echo [3/5] Installing frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)
cd ..
echo.

echo [4/5] Checking environment configuration...
if not exist backend\.env (
    echo WARNING: backend\.env file not found!
    echo Copying from .env.example...
    copy backend\env.example backend\.env
    echo.
    echo IMPORTANT: Please edit backend\.env with your configuration
    echo Press any key to open the file...
    pause >nul
    notepad backend\.env
)
echo.

echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Make sure MongoDB is running
echo 2. Configure backend\.env file
echo 3. Run 'npm run dev' in backend folder
echo 4. Run 'npm start' in frontend folder
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo ========================================
echo.
pause
