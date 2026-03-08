#!/usr/bin/env node
/**
 * Clean Script - Cleans build artifacts, cache, and temporary files
 * Usage: node scripts/clean.js [options]
 * Options: --all, --dist, --cache, --logs, --modules
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const neon = {
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;226m',
  red: '\x1b[38;5;196m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

const projectRoot = path.join(__dirname, '..');

const CLEAN_TARGETS = {
  dist: { path: 'dist', desc: 'Build output' },
  cache: { path: path.join(os.homedir(), '.cache', 'lightning-games-build'), desc: 'Build cache' },
  logs: { path: 'BuildLogs', desc: 'Build logs' },
  modules: { path: 'node_modules', desc: 'Dependencies' },
  release: { path: 'RELEASE-*.md', desc: 'Release notes', isGlob: true },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return false;
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch (e) {
    console.log(`${neon.red}✗ Failed: ${e.message}${neon.reset}`);
    return false;
  }
}

function removeGlob(pattern) {
  const files = require('glob').sync(pattern, { cwd: projectRoot });
  files.forEach(f => {
    try {
      fs.rmSync(path.join(projectRoot, f), { force: true });
    } catch {}
  });
  return files.length;
}

async function main() {
  const args = process.argv.slice(2);
  const cleanAll = args.includes('--all');
  const targets = [];

  // Determine what to clean
  if (cleanAll || args.length === 0) {
    targets.push('dist', 'cache', 'logs');
  } else {
    if (args.includes('--dist')) targets.push('dist');
    if (args.includes('--cache')) targets.push('cache');
    if (args.includes('--logs')) targets.push('logs');
    if (args.includes('--modules')) targets.push('modules');
    if (args.includes('--release')) targets.push('release');
  }

  console.log();
  console.log(`${neon.cyan}🧹 Lightning Games Cleaner${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(40)}${neon.reset}`);
  console.log();

  let totalFreed = 0;

  for (const target of targets) {
    const config = CLEAN_TARGETS[target];
    if (!config) continue;

    const targetPath = path.isAbsolute(config.path) 
      ? config.path 
      : path.join(projectRoot, config.path);

    console.log(`  ${neon.yellow}Cleaning ${target}...${neon.reset}`);
    console.log(`  ${neon.dim}${config.desc}: ${config.path}${neon.reset}`);

    if (config.isGlob) {
      const count = removeGlob(config.path);
      console.log(`${neon.green}  ✓ Removed ${count} files${neon.reset}`);
    } else {
      const size = getDirectorySize(targetPath);
      if (fs.existsSync(targetPath)) {
        if (removeDirectory(targetPath)) {
          console.log(`${neon.green}  ✓ Freed ${formatBytes(size)}${neon.reset}`);
          totalFreed += size;
        }
      } else {
        console.log(`${neon.dim}  ○ Already clean${neon.reset}`);
      }
    }
    console.log();
  }

  console.log(`${neon.dim}${'─'.repeat(40)}${neon.reset}`);
  console.log(`${neon.green}✓ Total freed: ${formatBytes(totalFreed)}${neon.reset}`);
  console.log();
}

main().catch(console.error);
