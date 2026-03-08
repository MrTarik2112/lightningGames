#!/usr/bin/env node
/**
 * Info Script - Display project information
 * Usage: node scripts/info.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const neon = {
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;226m',
  magenta: '\x1b[38;5;201m',
  purple: '\x1b[38;5;141m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const projectRoot = path.join(__dirname, '..');

function getPackageInfo() {
  const pkgPath = path.join(projectRoot, 'package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function countGames() {
  const gamesDir = path.join(projectRoot, 'games');
  if (!fs.existsSync(gamesDir)) return 0;
  return fs.readdirSync(gamesDir).filter(f => f.endsWith('.js')).length;
}

function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    npmVersion: require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
  };
}

function getProjectStructure() {
  const structure = {
    games: fs.existsSync(path.join(projectRoot, 'games')) ? 
      fs.readdirSync(path.join(projectRoot, 'games')).filter(f => f.endsWith('.js')).length : 0,
    renderer: fs.existsSync(path.join(projectRoot, 'renderer')) ? 
      fs.readdirSync(path.join(projectRoot, 'renderer')).filter(f => f.endsWith('.js')).length : 0,
    styles: fs.existsSync(path.join(projectRoot, 'styles')) ? 
      fs.readdirSync(path.join(projectRoot, 'styles')).filter(f => f.endsWith('.css')).length : 0,
    scripts: fs.existsSync(path.join(projectRoot, 'scripts')) ? 
      fs.readdirSync(path.join(projectRoot, 'scripts')).filter(f => f.endsWith('.js')).length : 0,
  };
  return structure;
}

async function main() {
  const pkg = getPackageInfo();
  const sys = getSystemInfo();
  const structure = getProjectStructure();
  const gameCount = countGames();
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}⚡ Lightning Games${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  
  // Project info
  console.log(`${neon.bold}Project${neon.reset}`);
  console.log(`  ${neon.dim}Name:${neon.reset}     ${pkg.name}`);
  console.log(`  ${neon.dim}Version:${neon.reset}  ${pkg.version}`);
  console.log(`  ${neon.dim}License:${neon.reset}  ${pkg.license || 'MIT'}`);
  console.log(`  ${neon.dim}Games:${neon.reset}    ${gameCount} games`);
  console.log();
  
  // Structure
  console.log(`${neon.bold}Structure${neon.reset}`);
  console.log(`  ${neon.dim}games/${neon.reset}     ${structure.games} files`);
  console.log(`  ${neon.dim}renderer/${neon.reset}  ${structure.renderer} files`);
  console.log(`  ${neon.dim}styles/${neon.reset}    ${structure.styles} files`);
  console.log(`  ${neon.dim}scripts/${neon.reset}   ${structure.scripts} files`);
  console.log();
  
  // System
  console.log(`${neon.bold}System${neon.reset}`);
  console.log(`  ${neon.dim}Platform:${neon.reset}  ${sys.platform} (${sys.arch})`);
  console.log(`  ${neon.dim}Node:${neon.reset}      ${sys.nodeVersion}`);
  console.log(`  ${neon.dim}npm:${neon.reset}       v${sys.npmVersion}`);
  console.log(`  ${neon.dim}CPUs:${neon.reset}      ${sys.cpus}`);
  console.log(`  ${neon.dim}Memory:${neon.reset}    ${sys.memory}`);
  console.log();
  
  // Scripts
  console.log(`${neon.bold}Available Scripts${neon.reset}`);
  console.log(`  ${neon.cyan}npm start${neon.reset}        Start the app`);
  console.log(`  ${neon.cyan}npm run dist${neon.reset}      Build with wizard`);
  console.log(`  ${neon.cyan}node scripts/dev.js${neon.reset}    Dev mode`);
  console.log(`  ${neon.cyan}node scripts/test.js${neon.reset}    Run tests`);
  console.log(`  ${neon.cyan}node scripts/stats.js${neon.reset}   View stats`);
  console.log(`  ${neon.cyan}node scripts/clean.js${neon.reset}   Clean artifacts`);
  console.log();
  
  // Dependencies
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = Object.keys(pkg.devDependencies || {});
  
  console.log(`${neon.bold}Dependencies${neon.reset}`);
  console.log(`  ${neon.dim}Runtime:${neon.reset}  ${deps.join(', ') || 'none'}`);
  console.log(`  ${neon.dim}Dev:${neon.reset}      ${devDeps.join(', ') || 'none'}`);
  console.log();
}

main().catch(console.error);
