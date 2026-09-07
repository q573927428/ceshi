@echo off
setlocal
title Treasure Assistant

cd /d "%~dp0"

node --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js was not found. Please install Node.js 20 or newer.
  pause
  exit /b 1
)

call pnpm --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: pnpm was not found. Please install pnpm 11.15.1 or newer.
  pause
  exit /b 1
)

if not exist ".output\server\index.mjs" (
  echo ERROR: Build output was not found: .output\server\index.mjs
  echo Please run "pnpm build" in this folder first.
  pause
  exit /b 1
)

echo Starting service at http://localhost:3000
echo Close this window to stop the service.
call pnpm start:env

echo.
echo Service stopped. Exit code: %errorlevel%
pause
endlocal
