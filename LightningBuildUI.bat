@echo off
title Lightning Games Build Wizard (ImGui)
cls
echo Launching Lightning Games Build UI (Dear ImGui) via WSL / WSLg...
echo.
wsl -d Ubuntu bash -c "export DISPLAY=:0 && cd /mnt/c/Users/tarik/OneDrive/Belgeler/lightninggames/build-ui/build && ./lightning-build-ui"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Failed to launch the UI. Make sure WSLg is working.
    pause
)
