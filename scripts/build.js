#!/usr/bin/env node
/**
 * Lightning Games Interactive Build Wizard
 * Features: Version selection, Platform selection (Windows, WSL Linux), Portable packaging
 * Usage: npm run dist
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const PackageManagerDetector = require('./detect-pm');

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const isWindows = process.platform === 'win32';
const pmDetector = new PackageManagerDetector();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// ===================== COLORS =====================
const neon = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// ===================== LOGGER =====================
const log = {
  info(msg) { console.log(`${neon.cyan}ℹ${neon.reset} ${msg}`); },
  success(msg) { console.log(`${neon.green}✓${neon.reset} ${neon.green}${msg}${neon.reset}`); },
  error(msg) { console.log(`${neon.red}✗${neon.reset} ${neon.red}${msg}${neon.reset}`); },
  warning(msg) { console.log(`${neon.yellow}⚠${neon.reset} ${neon.yellow}${msg}${neon.reset}`); },
  step(msg) { console.log(`${neon.yellow}→${neon.reset} ${msg}`); },
  section(title) { console.log(`\n${neon.cyan}${neon.bold}╔══ ${title} ══╗${neon.reset}`); },
};

// ===================== UTILITIES =====================
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function hasWSL() {
  if (!isWindows) return false;
  try {
    // Check if wsl.exe exists
    execSync('where wsl', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    // Try to run a simple command with timeout
    execSync('wsl echo "test"', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    });
    return true;
  } catch {
    return false;
  }
}

function validateVersion(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

// ===================== BUILD EXECUTOR =====================
function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: ['inherit', 'inherit', 'inherit'],  // Allow stdin passthrough for sudo password
      shell: true,
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });

    proc.on('error', reject);
  });
}

// ===================== CHECK LINUX DEPENDENCIES =====================
async function checkLinuxDependencies() {
  log.section('Checking Linux Dependencies');
  
  const deps = ['dpkg', 'fakeroot'];
  const missing = [];
  
  for (const dep of deps) {
    try {
      execSync(`wsl which ${dep}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      log.success(`${dep} found`);
    } catch {
      missing.push(dep);
      log.warning(`${dep} not found`);
    }
  }
  
  if (missing.length > 0) {
    log.error(`Missing dependencies: ${missing.join(', ')}`);
    log.info(`Install with: wsl sudo apt-get install -y ${missing.join(' ')}`);
    return false;
  }
  
  return true;
}

// ===================== BUILD WINDOWS =====================
async function buildWindows(compression, compressionName) {
  log.section('Building Windows Portable');
  
  const pm = pmDetector.getPreferred();
  const builderPath = pmDetector.getBuilderPath();
  const icon = pm === 'bun' ? '⚡' : '📦';
  
  log.info(`Using ${icon} ${neon.yellow}${pm}${neon.reset} for build`);
  
  // ULTRA MEGA mode: Use maximum compression
  if (compressionName === 'ULTRA MEGA') {
    log.info(`${neon.magenta}💎 ULTRA MEGA MODE ACTIVATED${neon.reset}`);
    log.step(`Running: ${builderPath} --win portable --config.compression=maximum`);
    
    try {
      await runCommand(builderPath, ['--win', 'portable', '--config.compression=maximum']);
      log.success('Windows build complete');
      return true;
    } catch (err) {
      log.error(`Windows build failed: ${err.message}`);
      return false;
    }
  } else {
    log.step(`Running: ${builderPath} --win portable --config.compression=${compression}`);
    
    try {
      await runCommand(builderPath, ['--win', 'portable', `--config.compression=${compression}`]);
      log.success('Windows build complete');
      return true;
    } catch (err) {
      log.error(`Windows build failed: ${err.message}`);
      return false;
    }
  }
}

// ===================== BUILD LINUX (WSL) =====================
async function buildLinux(compression, compressionName) {
  log.section('Building Linux AppImage (WSL)');
  
  if (!hasWSL()) {
    log.error('WSL not available - skipping Linux build');
    log.info('Install WSL: https://docs.microsoft.com/en-us/windows/wsl/install');
    return false;
  }

  // Check for rsync
  try {
    execSync('wsl which rsync', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    log.error('rsync not found in WSL');
    log.info('Install rsync: wsl sudo apt-get install -y rsync');
    return false;
  }

  const pm = pmDetector.getPreferred();
  const icon = pm === 'bun' ? '⚡' : '📦';
  
  log.info(`Using ${icon} ${neon.yellow}${pm}${neon.reset} for build`);
  log.info('Building in WSL Linux filesystem (avoids permission issues)');
  
  try {
    // Convert Windows path to WSL path
    const wslSourcePath = `/mnt/c${projectRoot.substring(2).replace(/\\/g, '/')}`;
    const timestamp = Date.now();
    const linuxBuildPath = `$HOME/lightning-games-build-${timestamp}`;
    
    // Create a temporary bash script to avoid escaping issues
    const scriptContent = `#!/bin/bash
set -e

echo "🐧 Starting Linux build in WSL..."
export DEBIAN_FRONTEND=noninteractive

# Clean up any previous build
rm -rf "${linuxBuildPath}"
mkdir -p "${linuxBuildPath}"

echo "📂 Copying project to Linux filesystem..."
rsync -a --exclude='node_modules' --exclude='dist' --exclude='BuildLogs' --exclude='.git' "${wslSourcePath}/" "${linuxBuildPath}/"

cd "${linuxBuildPath}"

echo "📥 Installing dependencies..."
npm install

echo "🔨 Building AppImage..."
npx electron-builder --linux AppImage --config.compression=${compression}

echo "📋 Copying build artifacts back to Windows..."
mkdir -p "${wslSourcePath}/dist"
find "${linuxBuildPath}/dist" -name "*.AppImage" -exec cp -v {} "${wslSourcePath}/dist/" \\;

echo "🧹 Cleaning up..."
rm -rf "${linuxBuildPath}"

echo "✅ Linux build complete!"
`;

    // Write script to temp file
    const scriptPath = path.join(projectRoot, 'temp_build_linux.sh');
    fs.writeFileSync(scriptPath, scriptContent);
    
    // Convert script path to WSL path
    const wslScriptPath = `/mnt/c${scriptPath.substring(2).replace(/\\/g, '/')}`;
    
    log.step(`Running build script in WSL...`);
    await runCommand('wsl', ['bash', wslScriptPath], { shell: false });
    
    // Clean up script
    fs.unlinkSync(scriptPath);
    
    log.success('Linux build complete');
    return true;
  } catch (err) {
    log.error(`Linux build failed: ${err.message}`);
    log.info('Troubleshooting:');
    log.info('1. Verify WSL: wsl --list --verbose');
    log.info('2. Check npm in WSL: wsl npm --version');
    log.info('3. Install rsync: wsl sudo apt-get install -y rsync');
    log.info('4. Manual build: wsl bash -c "cd ~ && mkdir test && cd test && npm init -y && npm install electron-builder"');
    return false;
  }
}

// ===================== VERIFY ARTIFACTS =====================
function verifyArtifacts() {
  log.section('Build Artifacts');
  
  const distDir = path.join(projectRoot, 'dist');
  const artifacts = [];

  if (fs.existsSync(distDir)) {
    for (const file of fs.readdirSync(distDir)) {
      if (file.endsWith('.exe') || file.endsWith('.AppImage')) {
        const filePath = path.join(distDir, file);
        const stat = fs.statSync(filePath);
        artifacts.push({ name: file, size: formatBytes(stat.size) });
      }
    }
  }

  if (artifacts.length === 0) {
    log.error('No artifacts found in dist/');
    return false;
  }

  artifacts.forEach(artifact => {
    log.success(`${artifact.name} ${neon.dim}(${artifact.size})${neon.reset}`);
  });

  return true;
}

// ===================== MAIN =====================
async function main() {
  const startTime = Date.now();

  // ===================== HEADER =====================
  const pm = pmDetector.getPreferred();
  const pmIcon = pm === 'bun' ? '⚡' : '📦';
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}⚡ Lightning Games Build Wizard  🪄${neon.reset}`);
  console.log(`${neon.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${neon.reset}`);
  console.log(`${neon.dim}Package Manager: ${pmIcon} ${pm}${neon.reset}`);
  console.log();

  try {
    // ===================== VERSION SELECTION =====================
    log.section('Version Configuration');
    console.log();
    console.log(`  ${neon.dim}Current version:${neon.reset} ${neon.yellow}${packageJson.version}${neon.reset}`);
    console.log();

    // Parse current version for quick increment
    const currentParts = packageJson.version.split('.').map(Number);
    const nextPatch = `${currentParts[0]}.${currentParts[1]}.${currentParts[2] + 1}`;
    const nextMinor = `${currentParts[0]}.${currentParts[1] + 1}.0`;
    const nextMajor = `${currentParts[0] + 1}.0.0`;

    console.log(`  ${neon.bold}[1]${neon.reset} 🔧  Patch    ${neon.dim}${nextPatch}  (bug fixes)${neon.reset}`);
    console.log(`  ${neon.bold}[2]${neon.reset} ✨  Minor    ${neon.dim}${nextMinor}  (new features)${neon.reset}`);
    console.log(`  ${neon.bold}[3]${neon.reset} 🚀  Major    ${neon.dim}${nextMajor}  (big changes)${neon.reset}`);
    console.log(`  ${neon.bold}[4]${neon.reset} 🎯  Custom   ${neon.dim}Enter your own version${neon.reset}`);
    console.log(`  ${neon.bold}[Enter]${neon.reset} ⏭️  Skip     ${neon.dim}Keep current (${packageJson.version})${neon.reset}`);
    console.log();

    const versionInput = await question(`  ${neon.cyan}Select version option${neon.reset} [1-4 or Enter]: `);
    const choice = versionInput.trim();

    let newVersion = packageJson.version;

    if (choice === '1') {
      newVersion = nextPatch;
    } else if (choice === '2') {
      newVersion = nextMinor;
    } else if (choice === '3') {
      newVersion = nextMajor;
    } else if (choice === '4') {
      const customVersion = await question(`  ${neon.cyan}Enter version${neon.reset} (e.g., 1.2.3): `);
      const normalizedCustom = customVersion.trim().replace(/^[vV]/, '');
      if (validateVersion(normalizedCustom)) {
        newVersion = normalizedCustom;
      } else {
        log.error(`Invalid version format: "${normalizedCustom}"`);
        log.info(`Keeping version ${neon.yellow}${packageJson.version}${neon.reset}`);
        newVersion = packageJson.version;
      }
    } else if (choice === '') {
      log.info(`Keeping version ${neon.yellow}${packageJson.version}${neon.reset}`);
    } else {
      log.warning(`Invalid choice: "${choice}" - keeping current version`);
    }

    // Update version if changed
    if (newVersion !== packageJson.version) {
      // Update package.json
      packageJson.version = newVersion;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

      // Update version in index.html
      const indexHtmlPath = path.join(projectRoot, 'index.html');
      let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
      indexHtml = indexHtml.replace(
        /<span class="title-version">v[\d.]+<\/span>/,
        `<span class="title-version">v${newVersion}</span>`
      );
      fs.writeFileSync(indexHtmlPath, indexHtml);

      // Update version in README.md
      const readmePath = path.join(projectRoot, 'README.md');
      if (fs.existsSync(readmePath)) {
        let readme = fs.readFileSync(readmePath, 'utf8');
        readme = readme.replace(/version-\d+\.\d+\.\d+/, `version-${newVersion}`);
        fs.writeFileSync(readmePath, readme);
      }

      // Update version in AGENTS.md
      const agentsPath = path.join(projectRoot, 'AGENTS.md');
      if (fs.existsSync(agentsPath)) {
        let agents = fs.readFileSync(agentsPath, 'utf8');
        agents = agents.replace(/> \*\*Version:\*\* \d+\.\d+\.\d+/, `> **Version:** ${newVersion}`);
        fs.writeFileSync(agentsPath, agents);
      }

      log.success(`Version updated to ${neon.yellow}${newVersion}${neon.reset} (package.json, index.html, README.md, AGENTS.md)`);
    }

    // ===================== PLATFORM SELECTION =====================
    log.section('Platform Selection');
    console.log();

    const wslAvailable = hasWSL();

    console.log(`  ${neon.bold}[1]${neon.reset} 🪟  Windows Portable       ${neon.dim}Single .exe file${neon.reset}`);
    console.log(`  ${neon.bold}[2]${neon.reset} 🐧  Linux AppImage (WSL)   ${!wslAvailable ? neon.red + '[WSL not available]' : neon.dim + 'Via WSL Linux filesystem'}${neon.reset}`);
    console.log(`  ${neon.bold}[3]${neon.reset} ⚡  Both Platforms         ${!wslAvailable ? neon.red + '[WSL required]' : neon.dim + 'Windows + Linux'}${neon.reset}`);
    console.log();

    const platformInput = await question(`  ${neon.cyan}Select platform${neon.reset} [1-3] (default: 1): `);
    const platformChoice = platformInput.trim() || '1';

    let selectedPlatforms = [];

    switch (platformChoice) {
      case '1':
        selectedPlatforms = ['windows'];
        break;
      case '2':
        if (wslAvailable) {
          selectedPlatforms = ['linux'];
        } else {
          log.error('WSL not available - falling back to Windows only');
          selectedPlatforms = ['windows'];
        }
        break;
      case '3':
        if (wslAvailable) {
          selectedPlatforms = ['windows', 'linux'];
        } else {
          log.error('WSL not available - falling back to Windows only');
          selectedPlatforms = ['windows'];
        }
        break;
      default:
        log.warning(`Invalid choice: ${platformChoice} - using Windows`);
        selectedPlatforms = ['windows'];
    }

    console.log();
    log.info(`Building for: ${neon.yellow}${selectedPlatforms.join(', ')}${neon.reset}`);

    // ===================== COMPRESSION SELECTION =====================
    log.section('Compression Level');
    console.log();

    console.log(`  ${neon.bold}[1]${neon.reset} 📦  Store        ${neon.dim}No compression (~140MB, ~5s)${neon.reset}`);
    console.log(`  ${neon.bold}[2]${neon.reset} ⚡  Normal       ${neon.dim}Balanced (~105MB, ~50s)${neon.reset}`);
    console.log(`  ${neon.bold}[3]${neon.reset} 🔥  Maximum      ${neon.dim}High compression (~85MB, ~90s)${neon.reset}`);
    console.log(`  ${neon.bold}[4]${neon.reset} 💎  ULTRA MEGA   ${neon.dim}${neon.magenta}EXTREME compression (~65MB, ~3m)${neon.reset}`);
    console.log();

    const compressionInput = await question(`  ${neon.cyan}Select compression${neon.reset} [1-4] (default: 2): `);
    const compressionChoice = compressionInput.trim() || '2';

    let compressionLevel = 'normal';
    let compressionName = 'Normal';

    switch (compressionChoice) {
      case '1':
        compressionLevel = 'store';
        compressionName = 'Store';
        break;
      case '2':
        compressionLevel = 'normal';
        compressionName = 'Normal';
        break;
      case '3':
        compressionLevel = 'maximum';
        compressionName = 'Maximum';
        break;
      case '4':
        compressionLevel = 'maximum';
        compressionName = 'ULTRA MEGA';
        break;
      default:
        log.warning(`Invalid choice: ${compressionChoice} - using Normal`);
        compressionLevel = 'normal';
        compressionName = 'Normal';
    }

    console.log();
    log.info(`Compression: ${neon.yellow}${compressionName}${neon.reset}`);
    console.log();

    // ===================== CONFIRMATION =====================
    const confirm = await question(`  ${neon.green}Start build?${neon.reset} [Y/n]: `);
    if (confirm.toLowerCase() === 'n') {
      log.warning('Build cancelled');
      rl.close();
      process.exit(0);
    }

    console.log();
    log.section('Building Packages');
    console.log();

    // ===================== BUILD EXECUTION =====================
    const results = {
      windows: false,
      linux: false
    };

    if (selectedPlatforms.includes('windows')) {
      results.windows = await buildWindows(compressionLevel, compressionName);
    }

    if (selectedPlatforms.includes('linux')) {
      results.linux = await buildLinux(compressionLevel, compressionName);
    }

    // ===================== VERIFICATION =====================
    console.log();
    const verified = verifyArtifacts();

    // ===================== SUMMARY =====================
    console.log();
    log.section('Build Summary');
    console.log();
    console.log(`  ${neon.dim}Version:${neon.reset}     ${neon.yellow}${newVersion}${neon.reset}`);
    console.log(`  ${neon.dim}Compression:${neon.reset} ${neon.yellow}${compressionName}${neon.reset}`);
    console.log(`  ${neon.dim}Windows:${neon.reset}     ${results.windows ? neon.green + '✓ Success' : neon.red + '✗ Failed'}${neon.reset}`);
    console.log(`  ${neon.dim}Linux:${neon.reset}       ${selectedPlatforms.includes('linux') ? (results.linux ? neon.green + '✓ Success' : neon.red + '✗ Failed') : neon.dim + '- Skipped'}${neon.reset}`);
    console.log(`  ${neon.dim}Duration:${neon.reset}    ${neon.cyan}${formatDuration(Date.now() - startTime)}${neon.reset}`);
    console.log();

    const allSuccess = selectedPlatforms.every(p => results[p]);

    if (verified && allSuccess) {
      console.log(`${neon.green}${neon.bold}✓ Build completed successfully!${neon.reset}`);
      console.log();
      console.log(`  ${neon.dim}Output directory:${neon.reset} ${neon.cyan}dist/${neon.reset}`);
      console.log();
      rl.close();
      process.exit(0);
    } else {
      console.log(`${neon.red}${neon.bold}✗ Build incomplete${neon.reset}`);
      console.log();
      rl.close();
      process.exit(1);
    }
  } catch (err) {
    console.log();
    log.error(`Build failed: ${err.message}`);
    console.log();
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log();
  log.warning('Build cancelled by user');
  console.log();
  rl.close();
  process.exit(0);
});

main();
