@echo off
echo === Travel Health Bridge: Absolute Technical Closure ===

echo [1/4] NUCLEAR RESET: Purging all Node processes...
wmic process where "name='node.exe'" delete >nul 2>&1
timeout /t 3 >nul

set ROOT=%~dp0

echo [2/4] Clearing caches...
if exist apps\consumer\.expo rmdir /s /q apps\consumer\.expo
if exist apps\provider\.expo rmdir /s /q apps\provider\.expo
if exist apps\admin\.next rmdir /s /q apps\admin\.next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .turbo rmdir /s /q .turbo
timeout /t 1 >nul

echo [3/4] Starting Admin on 127.0.0.1:3000...
start "THB-Admin" cmd /k "cd /d %ROOT%apps\admin && npx next dev -p 3000 -H 127.0.0.1"
timeout /t 15 >nul

echo [4/4] Starting Consumer on 127.0.0.1:8081 (Isolated Namespace)...
start "THB-Consumer" cmd /k "cd /d %ROOT%apps\consumer && set EXPO_METRO_PORT=8081 && set EXPO_ROUTER_APP_ROOT=c-app && set CI=1 && npx expo start --web --port 8081 --host 127.0.0.1 --projectRoot "%ROOT%apps\consumer" --non-interactive --clear"
timeout /t 5 >nul

echo [5/5] Starting Provider on 127.0.0.1:8082 (Isolated Namespace)...
start "THB-Provider" cmd /k "cd /d %ROOT%apps\provider && set EXPO_METRO_PORT=8083 && set EXPO_ROUTER_APP_ROOT=p-app && set CI=1 && npx expo start --web --port 8082 --host 127.0.0.1 --projectRoot "%ROOT%apps\provider" --non-interactive --clear"

echo.
echo === Universal Closure Active: Absolute Isolation ===
echo   Admin:    http://127.0.0.1:3000/dashboard
echo   Consumer: http://127.0.0.1:8081 (Isolated Namespace)
echo   Provider: http://127.0.0.1:8082 (Isolated Namespace)
echo.
echo NOTE: Generic 'app/' folders have been renamed to 'c-app'
echo and 'p-app' to physically prevent Metro filesystem wandering.
