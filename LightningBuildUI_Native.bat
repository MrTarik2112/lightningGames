@echo off
title Lightning Games Build Wizard (Native)
cls
echo Launching Lightning Games Build UI (Native Windows EXE)...
echo.
if exist "build-ui\build_win\lightning-build-ui.exe" (
    start "" "build-ui\build_win\lightning-build-ui.exe"
) else (
    echo Error: lightning-build-ui.exe not found!
    echo Please run 'npm run ui:compile-win' first to build the Windows version.
    pause
)

