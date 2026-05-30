@echo off
title CryptoTrack - Make App
cd /d "%~dp0"
echo Installing dependencies...
call npm run install:all
if errorlevel 1 exit /b 1
echo Building app...
call npm run build
if errorlevel 1 exit /b 1
echo Starting CryptoTrack at http://localhost:3000
set SERVE_CLIENT=true
cd Server
npm start
