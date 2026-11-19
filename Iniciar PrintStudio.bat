@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 goto usepy
where python >nul 2>nul
if %errorlevel%==0 goto usepython
echo No se encontro Python en este ordenador.
echo Instala Python 3 y vuelve a ejecutar este archivo.
pause
exit /b 1
:usepy
start "" /b cmd /c "timeout /t 2 >nul & start http://127.0.0.1:8765"
py -3 -m http.server 8765 --bind 127.0.0.1
goto end
:usepython
start "" /b cmd /c "timeout /t 2 >nul & start http://127.0.0.1:8765"
python -m http.server 8765 --bind 127.0.0.1
:end
pause
