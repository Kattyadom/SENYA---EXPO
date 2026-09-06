@echo off
setlocal
cd /d "%~dp0"
set "SENYA_NODE="
where node.exe >nul 2>&1
if not errorlevel 1 set "SENYA_NODE=node.exe"
if not defined SENYA_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "SENYA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined SENYA_NODE (
 echo Node.js 22 or newer is required. Install it from https://nodejs.org
 pause
 exit /b 1
)
if not exist "node_modules\express\package.json" (
 echo Dependencies are missing. Run npm ci in this folder first.
 pause
 exit /b 1
)
echo Starting SENYA. Keep this window open.
echo Open http://localhost:3000/signin.html in your browser.
echo Press Ctrl+C to stop the server.
"%SENYA_NODE%" --env-file=.env server.cjs
echo The server has stopped. If port 3000 is already in use, SENYA may already be running.
pause
