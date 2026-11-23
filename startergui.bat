@echo off
title IPA CENTER
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no esta instalado. Instala Node.js LTS para ejecutar IPA CENTER.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias...
  npm install
)
start "" http://localhost:5173
npm run dev
