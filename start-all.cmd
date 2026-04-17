@echo off
echo === Travel Health Bridge Nuclear Reset + Launch ===

echo [1/4] Killing all node processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 >nul

echo [2/4] Clearing caches...
if exist apps\consumer\.expo rmdir /s /q apps\consumer\.expo
if exist apps\provider\.expo rmdir /s /q apps\provider\.expo
if exist apps\admin\.next rmdir /s /q apps\admin\.next
if exist .turbo rmdir /s /q .turbo
timeout /t 1 >nul

echo [3/4] Starting Admin on port 3000...
start "THB-Admin" cmd /k "cd /d %~dp0apps\admin && npx next dev -p 3000"
timeout /t 5 >nul

echo [4/4] Starting Consumer on port 8081...
start "THB-Consumer" cmd /k "cd /d %~dp0apps\consumer && npx expo start --web --port 8081 --clear"
timeout /t 5 >nul

echo [5/5] Starting Provider on port 8082...
start "THB-Provider" cmd /k "cd /d %~dp0apps\provider && npx expo start --web --port 8082 --clear"

echo.
echo === All services launching. Wait ~60s for Metro to bundle ===
echo   Admin:    http://localhost:3000/dashboard
echo   Consumer: http://localhost:8081
echo   Provider: http://localhost:8082
echo.
