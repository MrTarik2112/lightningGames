#!/bin/bash
set -e


SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "============================================"
echo "  Lightning Games Build UI - Setup"
echo "============================================"
echo ""











# 0. Check if running as root
if [ "$(id -u)" -eq 0 ]; then
    echo "Error: This script should not be run as root."
    echo "Please run: ./setup.sh"
    exit 1
fi


# 1. Install system dependencies
echo "[1/4] Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get upgrade -y
sudo apt-get install -y build-essential cmake git curl libglfw3-dev libgl1-mesa-dev

# 2. Download Dear ImGui
echo ""
echo "[2/4] Downloading Dear ImGui..."
if [ ! -d "libs/imgui" ]; then
    git clone --depth 1 --branch v1.91.8 https://github.com/ocornut/imgui.git libs/imgui
    echo "  Downloaded imgui v1.91.8"
else
    echo "  Already exists, skipping"
fi

# 3. Download nlohmann/json single header
echo ""
echo "[3/4] Downloading nlohmann/json..."
mkdir -p libs/json
if [ ! -f "libs/json/json.hpp" ]; then
    curl -sL -o libs/json/json.hpp \
        https://github.com/nlohmann/json/releases/download/v3.11.3/json.hpp
    echo "  Downloaded json.hpp v3.11.3"
else
    echo "  Already exists, skipping"
fi





# 4. Build
echo ""
echo "[4/4] Building application..."
mkdir -p build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)






echo ""
echo "============================================"
echo "  Build complete!"
echo "  Run: ./build/lightning-build-ui"
echo "============================================"
echo ""
