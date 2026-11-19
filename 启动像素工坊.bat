@echo off
setlocal
set "HTML=%~dp0index.html"

if not exist "%HTML%" (
  echo [Pixel Forge] Could not find index.html next to this launcher.
  pause
  exit /b 1
)

rem Prefer a clean app-style Edge window. The file URL is encoded with
rem PowerShell so spaces and Chinese characters in the folder path work.
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE%" (
  set "PF_HTML=%HTML%"
  set "PF_EDGE=%EDGE%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$u=[System.Uri]::new($env:PF_HTML).AbsoluteUri; $a='--app='+[char]34+$u+[char]34; Start-Process -FilePath $env:PF_EDGE -ArgumentList $a" >nul 2>&1
  if not errorlevel 1 exit /b 0
)

rem No Edge or app-mode launch failed: let Windows pick the default browser.
start "" "%HTML%"
endlocal
