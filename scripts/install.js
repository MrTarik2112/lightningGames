#!/usr/bin/env node
/**
 * Install Script - Setup project dependencies and environment
 * Usage: node scripts/install.js
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const PackageManagerDetector = require('./detect-pm');

const neon = {
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;226m',
  red: '\x1b[38;5;196m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const projectRoot = path.join(__dirname, '..');
const pmDetector = new PackageManagerDetector();

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major < 16) {
    console.log(`${neon.red}✗ Node.js ${version} is too old. Requires v16+${neon.reset}`);
    return false;
  }
  
  console.log(`${neon.green}✓ Node.js ${version}${neon.reset}`);
  return true;
}

function checkPackageManagers() {
  const report = pmDetector.detect();
  
  if (report.bun.available) {
    console.log(`${neon.green}✓ Bun v${report.bun.version}${neon.reset} ${neon.dim}(preferred)${neon.reset}`);
  } else {
    console.log(`${neon.dim}○ Bun not installed${neon.reset} ${neon.dim}(optional, faster)${neon.reset}`);
  }
  
  if (report.npm.available) {
    const preferred = !report.bun.available ? ` ${neon.dim}(fallback)${neon.reset}` : '';
    console.log(`${neon.green}✓ npm v${report.npm.version}${neon.reset}${preferred}`);
  } else {
    console.log(`${neon.red}✗ npm not found${neon.reset}`);
  }
  
  return report.preferred !== null;
}

function checkGit() {
  try {
    const version = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`${neon.green}✓ ${version}${neon.reset}`);
    return true;
  } catch {
    console.log(`${neon.yellow}⚠ git not found (optional)${neon.reset}`);
    return true;
  }
}

async function installDependencies() {
  return new Promise((resolve) => {
    console.log();
    
    const pm = pmDetector.getPreferred();
    const installCmd = pmDetector.getCommand('install');
    
    if (!pm || !installCmd) {
      console.log(`${neon.red}✗ No package manager available${neon.reset}`);
      resolve(false);
      return;
    }
    
    const icon = pm === 'bun' ? '⚡' : '📦';
    console.log(`${neon.cyan}${icon} Installing dependencies with ${pm}...${neon.reset}`);
    
    const [cmd, ...args] = installCmd.split(' ');
    const proc = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`${neon.green}✓ Dependencies installed${neon.reset}`);
        resolve(true);
      } else {
        console.log(`${neon.red}✗ ${pm} install failed${neon.reset}`);
        resolve(false);
      }
    });
  });
}

function createDirectories() {
  const dirs = ['dist', 'BuildLogs'];
  
  for (const dir of dirs) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`${neon.green}✓ Created ${dir}/${neon.reset}`);
    } else {
      console.log(`${neon.dim}○ ${dir}/ exists${neon.reset}`);
    }
  }
}

function checkPlatformSpecific() {
  const platform = os.platform();
  
  console.log();
  console.log(`${neon.cyan}Platform-specific checks${neon.reset}`);
  
  if (platform === 'win32') {
    // Check for Windows Build Tools
    try {
      execSync('where python', { stdio: 'pipe' });
      console.log(`${neon.green}✓ Python available${neon.reset}`);
    } catch {
      console.log(`${neon.yellow}⚠ Python not found (needed for some native modules)${neon.reset}`);
    }
    
    // Check for WSL
    try {
      execSync('wsl --list', { stdio: 'pipe' });
      console.log(`${neon.green}✓ WSL available${neon.reset}`);
    } catch {
      console.log(`${neon.dim}○ WSL not installed (needed for Linux builds)${neon.reset}`);
    }
  } else if (platform === 'linux') {
    // Check for required libraries
    const libs = ['libgtk-3-0', 'libnss3'];
    console.log(`${neon.dim}○ Linux detected - ensure GUI libraries are installed${neon.reset}`);
  } else if (platform === 'darwin') {
    console.log(`${neon.green}✓ macOS detected${neon.reset}`);
  }
}

async function main() {
  console.log();
  console.log(`${neon.cyan}${neon.bold}⚙ Lightning Games Setup${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  
  console.log(`${neon.bold}Checking prerequisites...${neon.reset}`);
  
  const nodeOk = checkNodeVersion();
  const pmOk = checkPackageManagers();
  const gitOk = checkGit();
  
  if (!nodeOk || !pmOk) {
    console.log();
    console.log(`${neon.red}Please install required tools and try again.${neon.reset}`);
    console.log();
    console.log(`  ${neon.cyan}Bun (recommended):${neon.reset} https://bun.sh`);
    console.log(`  ${neon.cyan}Node.js + npm:${neon.reset} https://nodejs.org`);
    process.exit(1);
  }
  
  console.log();
  console.log(`${neon.bold}Setting up project...${neon.reset}`);
  
  createDirectories();
  
  const installOk = await installDependencies();
  
  checkPlatformSpecific();
  
  console.log();
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  
  if (installOk) {
    console.log(`${neon.green}✓ Setup complete!${neon.reset}`);
    console.log();
    
    const pm = pmDetector.getPreferred();
    const runCmd = pm === 'bun' ? 'bun run' : 'npm run';
    const startCmd = pm === 'bun' ? 'bun start' : 'npm start';
    
    console.log(`  Run ${neon.cyan}${startCmd}${neon.reset} to launch the app`);
    console.log(`  Run ${neon.cyan}${runCmd} dist${neon.reset} to build`);
    console.log();
  } else {
    console.log(`${neon.red}✗ Setup failed${neon.reset}`);
    process.exit(1);
  }
}

main().catch(console.error);
