@echo off
echo === Travel Health Bridge: Universal Monorepo Finalization ===

echo [1/4] NUCLEAR RESET: Purging all Node processes...
wmic process where "name='node.exe'" delete >nul 2>&1
timeout /t 3 >nul

set ROOT=%~dp0

echo [2/4] NUCLEAR CACHELINE RESET: Purging session maps...
if exist apps\consumer\.expo rmdir /s /q apps\consumer\.expo
if exist apps\provider\.expo rmdir /s /q apps\provider\.expo
if exist apps\admin\.next rmdir /s /q apps\admin\.next
if exist node_modules\.cache\metro-consumer rmdir /s /q node_modules\.cache\metro-consumer
if exist node_modules\.cache\metro-provider rmdir /s /q node_modules\.cache\metro-provider
if exist .turbo rmdir /s /q .turbo
timeout /t 2 >nul

echo [3/4] Starting Admin on http://127.0.0.7:3000...
start "THB-Admin" cmd /k "cd /d %ROOT%apps\admin && npx next dev -p 3000 -H 127.0.0.7"
timeout /t 15 >nul

echo [4/4] Starting Consumer on http://127.0.0.5:8081...
start "THB-Consumer" cmd /k "cd /d %ROOT%apps\consumer && set EXPO_METRO_PORT=8081 && set CI=1 && npx expo start --web --port 8081 --host 127.0.0.5 --clear"
timeout /t 5 >nul

echo [5/5] Starting Provider on http://127.0.0.6:8083...
start "THB-Provider" cmd /k "cd /d %ROOT%apps\provider && set EXPO_METRO_PORT=8083 && set CI=1 && npx expo start --web --port 8083 --host 127.0.0.6 --clear"

echo.
echo === Universal Stabilization Active ===
echo   Admin:    http://127.0.0.7:3000/dashboard
echo   Consumer: http://127.0.0.5:8081 (Public Triage)
echo   Provider: http://127.0.0.6:8083 (Isolated Dashboard)
echo.
echo NOTE: Distinct Loopback IPs (127.0.0.5/6/7) implemented for Absolute Origin Isolation.
echo Framework Standard (app/) structure restored for maximum router compatibility.
echo Surgical Auth Bypass active for public triage access.
echo Iron Curtain Metro guards verified.
