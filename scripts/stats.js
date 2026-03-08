#!/usr/bin/env node
/**
 * Stats Script - Show project statistics
 * Usage: node scripts/stats.js
 */

const fs = require('fs');
const path = require('path');

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

function countLines(dir, exts = ['.js', '.html', '.css', '.json']) {
  let lines = 0;
  let files = 0;
  
  const walk = (currentDir) => {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (exts.some(ext => item.endsWith(ext))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            lines += content.split('\n').length;
            files++;
          } catch {}
        }
      }
    } catch {}
  };
  
  walk(dir);
  return { lines, files };
}

function countGames() {
  const gamesDir = path.join(projectRoot, 'games');
  if (!fs.existsSync(gamesDir)) return 0;
  return fs.readdirSync(gamesDir).filter(f => f.endsWith('.js')).length;
}

function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let size = 0;
  const walk = (dir) => {
    try {
      for (const item of fs.readdirSync(dir)) {
        const p = path.join(dir, item);
        const s = fs.statSync(p);
        size += s.isDirectory() ? walk(p) : s.size;
      }
    } catch {}
  };
  walk(dirPath);
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileCategoryStats() {
  const categories = {
    games: { files: 0, lines: 0, path: 'games' },
    renderer: { files: 0, lines: 0, path: 'renderer' },
    styles: { files: 0, lines: 0, path: 'styles' },
    scripts: { files: 0, lines: 0, path: 'scripts' },
    root: { files: 0, lines: 0, path: '.' },
  };
  
  for (const [name, cat] of Object.entries(categories)) {
    const catPath = path.join(projectRoot, cat.path);
    if (fs.existsSync(catPath)) {
      const stats = countLines(catPath);
      cat.files = stats.files;
      cat.lines = stats.lines;
    }
  }
  
  return categories;
}

async function main() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}📊 Lightning Games Statistics${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  
  // Project info
  console.log(`${neon.bold}Project${neon.reset}`);
  console.log(`  ${neon.dim}Version:${neon.reset} ${packageJson.version}`);
  console.log(`  ${neon.dim}Name:${neon.reset} ${packageJson.name}`);
  console.log();
  
  // Games
  const gameCount = countGames();
  console.log(`${neon.bold}Games${neon.reset}`);
  console.log(`  ${neon.green}Total games: ${gameCount}${neon.reset}`);
  console.log();
  
  // Code stats
  const totalStats = countLines(projectRoot);
  const categories = getFileCategoryStats();
  
  console.log(`${neon.bold}Code Statistics${neon.reset}`);
  console.log(`  ${neon.dim}Total files:${neon.reset} ${totalStats.files}`);
  console.log(`  ${neon.dim}Total lines:${neon.reset} ${totalStats.lines.toLocaleString()}`);
  console.log();
  
  console.log(`${neon.bold}By Category${neon.reset}`);
  for (const [name, cat] of Object.entries(categories)) {
    if (cat.files > 0) {
      console.log(`  ${neon.dim}${name.padEnd(10)}${neon.reset} ${cat.files.toString().padStart(3)} files, ${cat.lines.toLocaleString().padStart(7)} lines`);
    }
  }
  console.log();
  
  // Disk usage
  const distSize = getDirectorySize(path.join(projectRoot, 'dist'));
  const modulesSize = getDirectorySize(path.join(projectRoot, 'node_modules'));
  const totalSize = getDirectorySize(projectRoot);
  
  console.log(`${neon.bold}Disk Usage${neon.reset}`);
  console.log(`  ${neon.dim}Project:${neon.reset} ${formatBytes(totalSize)}`);
  console.log(`  ${neon.dim}node_modules:${neon.reset} ${formatBytes(modulesSize)}`);
  console.log(`  ${neon.dim}dist:${neon.reset} ${distSize > 0 ? formatBytes(distSize) : 'empty'}`);
  console.log();
  
  // Dependencies
  const deps = Object.keys(packageJson.dependencies || {}).length;
  const devDeps = Object.keys(packageJson.devDependencies || {}).length;
  
  console.log(`${neon.bold}Dependencies${neon.reset}`);
  console.log(`  ${neon.dim}Runtime:${neon.reset} ${deps}`);
  console.log(`  ${neon.dim}Dev:${neon.reset} ${devDeps}`);
  console.log();
}

main().catch(console.error);
