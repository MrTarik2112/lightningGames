#!/usr/bin/env node
/**
 * Package Script - Quick package for distribution without prompts
 * Usage: node scripts/package.js [platform]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

const PLATFORMS = {
  win: { target: 'portable', args: ['--win', 'portable'] },
  winzip: { target: 'zip', args: ['--win', 'zip'] },
  linux: { target: 'AppImage', args: ['--linux', 'AppImage'] },
  deb: { target: 'deb', args: ['--linux', 'deb'] },
  mac: { target: 'dmg', args: ['--mac', 'dmg'] },
};

async function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'win';
  
  const platformConfig = PLATFORMS[platform];
  if (!platformConfig) {
    console.log(`${neon.red}Unknown platform: ${platform}${neon.reset}`);
    console.log(`Available: ${Object.keys(PLATFORMS).join(', ')}`);
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}📦 Lightning Games Packer${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  console.log(`  ${neon.dim}Version:${neon.reset} ${packageJson.version}`);
  console.log(`  ${neon.dim}Platform:${neon.reset} ${platformConfig.target}`);
  console.log();
  
  const builderPath = path.join(projectRoot, 'node_modules', '.bin', 'electron-builder');
  const buildArgs = [...platformConfig.args, '--config.compression', 'normal'];
  
  console.log(`${neon.yellow}Building...${neon.reset}`);
  console.log();
  
  const build = spawn(builderPath, buildArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });
  
  build.on('close', (code) => {
    console.log();
    
    if (code === 0) {
      console.log(`${neon.green}✓ Build complete!${neon.reset}`);
      console.log();
      console.log(`  Output: ${neon.dim}dist/${neon.reset}`);
      console.log();
    } else {
      console.log(`${neon.red}✗ Build failed (code: ${code})${neon.reset}`);
      process.exit(1);
    }
  });
}

main().catch(console.error);
