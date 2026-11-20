@echo off
echo ========================================================
echo   RODEWAY EV CHARGING NETWORK - STARTING ALL SERVICES
echo ========================================================
echo.
echo Starting Backend API and Web Portal on http://localhost:5050 ...
cd /d "%~dp0server"
node server.js
