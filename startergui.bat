@echo off
setlocal
title IPA CENTER - Starter GUI
cd /d "%~dp0"
echo.
echo  =========================================
echo          IPA CENTER - STARTER GUI
echo  =========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado.
  echo Instala Node.js LTS desde https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Instalando dependencias del proyecto...
  call npm install
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias.
    pause
    exit /b 1
  )
)
echo Iniciando IPA CENTER...
start "" /B cmd /c "timeout /t 3 >nul & start chrome http://localhost:5173"
call npm run dev
pause
