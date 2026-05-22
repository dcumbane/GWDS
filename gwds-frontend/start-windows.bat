@echo off
REM ===========================================================
REM  Gaza Water Data System - Servidor local de desenvolvimento
REM  Duplo-clique para iniciar. Requer Python 3 instalado.
REM ===========================================================
cd /d "%~dp0"
echo.
echo  GWDS - servidor local
echo  --------------------------------------------------------
echo  Pasta: %CD%
echo  Servindo em http://localhost:8000
echo.
echo  Para PARAR o servidor, feche esta janela.
echo  --------------------------------------------------------
echo.
start "" "http://localhost:8000"
python -m http.server 8000 2>nul
if errorlevel 1 (
  echo.
  echo  ERRO: Python nao encontrado.
  echo  Instale Python 3 em https://www.python.org/downloads/
  echo  (Marque "Add Python to PATH" durante a instalacao.)
  echo.
  pause
)
