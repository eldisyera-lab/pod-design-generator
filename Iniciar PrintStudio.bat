@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "Iniciar PrintStudio.py"
  goto end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python "Iniciar PrintStudio.py"
  goto end
)
echo No se encontro Python 3 en este ordenador.
echo Instala Python 3 y vuelve a ejecutar este archivo.
pause
:end
pause
