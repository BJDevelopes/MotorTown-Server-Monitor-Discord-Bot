@echo off
REM Motortown Discord Bot - Setup Script for Windows

echo ======================================
echo Motortown Discord Bot Setup
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo Please install Node.js 16.9.0 or higher from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo + Node.js version: %NODE_VERSION%
echo.

REM Check if .env file exists
if exist ".env" (
    echo ! .env file already exists
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i "%OVERWRITE%"=="y" (
        copy /y .env.example .env >nul
        echo + Created new .env file from template
    ) else (
        echo Keeping existing .env file
    )
) else (
    copy .env.example .env >nul
    echo + Created .env file from template
)

echo.
echo ======================================
echo Installing Dependencies
echo ======================================
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo + Dependencies installed successfully!
) else (
    echo.
    echo X Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Edit .env file with your configuration:
echo    - Discord bot token
echo    - Server API details
echo    - Your Discord user ID
echo.
echo 2. Start the bot:
echo    npm start
echo.
echo Need help? Check docs\INSTALLATION.md
echo ======================================
echo.
pause
