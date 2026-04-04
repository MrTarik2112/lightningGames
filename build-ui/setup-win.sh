#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  Lightning Games Build UI - Windows Setup"
echo "============================================"

# 1. Check for MinGW
if ! command -v x86_64-w64-mingw32-g++ &> /dev/null; then
    echo "[1/4] Error: MinGW-w64 not found in WSL. Install it manually?"
    echo "Running: sudo apt install g++-mingw-w64-x86-64"
    sudo apt-get update -qq && sudo apt-get install -y g++-mingw-w64-x86-64
fi

# 2. Download Windows GLFW binaries
echo "[2/4] Downloading GLFW 3.4 for Windows (64-bit)..."
mkdir -p libs/glfw_win
if [ ! -f "libs/glfw_win/lib-mingw-w64/libglfw3.a" ]; then
    # Download the pre-compiled binary zip from GitHub
    curl -sL -o glfw_win.zip \
        https://github.com/glfw/glfw/releases/download/3.4/glfw-3.4.bin.WIN64.zip
    
    # Unzip specific folders: include and lib-mingw-w64
    unzip -o glfw_win.zip \
        "glfw-3.4.bin.WIN64/include/*" \
        "glfw-3.4.bin.WIN64/lib-mingw-w64/*" \
        -d libs/glfw_win_tmp
    
    # Move files to final location and clean up
    mv libs/glfw_win_tmp/glfw-3.4.bin.WIN64/include libs/glfw_win/
    mv libs/glfw_win_tmp/glfw-3.4.bin.WIN64/lib-mingw-w64 libs/glfw_win/
    rm -rf libs/glfw_win_tmp
    rm glfw_win.zip
    echo "  Downloaded and extracted GLFW"
else
    echo "  GLFW already exists, skipping"
fi

# 3. Download Cascadia Code Font
echo "[3/5] Downloading Cascadia Code font..."
mkdir -p fonts
if [ ! -f "fonts/CascadiaCode.ttf" ]; then
    curl -sL -o fonts/CascadiaCode.ttf \
        "https://github.com/microsoft/cascadia-code/releases/download/v2404.23/CascadiaCode.ttf"
    echo "  Downloaded Cascadia Code"
else
    echo "  Cascadia Code already exists, skipping"
fi

# 4. Build Windows version
echo "[4/5] Compiling Windows Native (.exe)..."
mkdir -p build_win
cd build_win
cmake .. -DCMAKE_TOOLCHAIN_FILE=../mingw-toolchain.cmake -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)

echo ""
echo "============================================"
echo "  Windows (.exe) build complete!"
echo "  Output: build_win/lightning-build-ui.exe"
echo "============================================"
echo ""
