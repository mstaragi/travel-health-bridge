@echo off
echo === Travel Health Bridge: Absolute Monorepo Partitioning ===

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

echo [3/4] Starting Admin on 127.0.0.4:3004 (Fortress Origin)...
start "THB-Admin" cmd /k "cd /d %ROOT%apps\admin && npx next dev -p 3004 -H 127.0.0.4"
timeout /t 15 >nul

echo [4/4] Starting Consumer on 127.0.0.5:8091 (Fortress Origin)...
start "THB-Consumer" cmd /k "cd /d %ROOT%apps\consumer && set EXPO_METRO_PORT=8091 && set EXPO_ROUTER_APP_ROOT=c-app && set CI=1 && npx expo start --web --port 8091 --host 127.0.0.5 --projectRoot "%ROOT%apps\consumer" --non-interactive --clear"
timeout /t 5 >nul

echo [5/5] Starting Provider on 127.0.0.6:8092 (Fortress Origin)...
start "THB-Provider" cmd /k "cd /d %ROOT%apps\provider && set EXPO_METRO_PORT=8083 && set EXPO_ROUTER_APP_ROOT=p-app && set CI=1 && npx expo start --web --port 8092 --host 127.0.0.6 --projectRoot "%ROOT%apps\provider" --non-interactive --clear"

echo.
echo === Universal Partitioning Active: Fortress Origins ===
echo   Admin:    http://127.0.0.4:3004/dashboard
echo   Consumer: http://127.0.0.5:8091 (Hardened Triage)
echo   Provider: http://127.0.0.6:8092 (Isolated Dashboard)
echo.
echo NOTE: services are now on UNIQUE Loopback IPs to prevent origin hijacking.
echo Triage auth-gate has been decentralized for 100%% public access.
