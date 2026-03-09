#!/usr/bin/env node
/**
 * Dev Script - Start development server with hot reload
 * Usage: node scripts/dev.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const PackageManagerDetector = require('./detect-pm');

const neon = {
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;226m',
  magenta: '\x1b[38;5;201m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const pmDetector = new PackageManagerDetector();

function checkDependencies() {
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`${neon.yellow}⚠ node_modules not found, running npm install...${neon.reset}`);
    return false;
  }
  return true;
}

async function main() {
  console.log();
  console.log(`${neon.cyan}${neon.bold}⚡ Lightning Games Dev Server${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(40)}${neon.reset}`);
  console.log();

  // Check dependencies
  if (!checkDependencies()) {
    const pm = pmDetector.getPreferred();
    const installCmd = pmDetector.getCommand('install');
    
    if (!pm || !installCmd) {
      console.log(`${neon.red}✗ No package manager available${neon.reset}`);
      process.exit(1);
    }
    
    const [cmd, ...args] = installCmd.split(' ');
    const install = spawn(cmd, args, { 
      cwd: projectRoot, 
      stdio: 'inherit',
      shell: true 
    });
    
    await new Promise((resolve) => {
      install.on('close', resolve);
    });
    console.log();
  }

  const pm = pmDetector.getPreferred();
  const icon = pm === 'bun' ? '⚡' : '📦';
  
  console.log(`${neon.green}✓ Starting Electron with ${pm}...${neon.reset}`);
  console.log(`${neon.dim}  Version: ${packageJson.version}${neon.reset}`);
  console.log(`${neon.dim}  Press Ctrl+C to stop${neon.reset}`);
  console.log();

  // Start electron with dev flags
  const electronPath = pmDetector.getElectronPath();
  const electron = spawn(electronPath, [
    '.',
    '--enable-logging',
    '--remote-debugging-port=9222',
  ], { 
    cwd: projectRoot, 
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ELECTRON_ENABLE_LOGGING: '1',
    }
  });

  electron.on('close', (code) => {
    console.log();
    console.log(`${neon.dim}Dev server stopped (code: ${code})${neon.reset}`);
    console.log();
    process.exit(code);
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log();
    console.log(`${neon.yellow}Shutting down...${neon.reset}`);
    electron.kill();
    process.exit(0);
  });
}

main().catch(console.error);
