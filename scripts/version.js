#!/usr/bin/env node
/**
 * Version Script - Quick version bump
 * Usage: node scripts/version.js [major|minor|patch|version]
 */

const fs = require('fs');
const path = require('path');

const neon = {
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;226m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');

function bumpVersion(version, type) {
  const parts = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
    default:
      if (/^\d+\.\d+\.\d+/.test(type)) {
        return type.replace(/^[vV]/, '');
      }
      return null;
  }
  
  return parts.join('.');
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = pkg.version;
  const newVersion = bumpVersion(currentVersion, type);
  
  if (!newVersion) {
    console.log(`${neon.yellow}Invalid version: ${type}${neon.reset}`);
    console.log(`Usage: node scripts/version.js [major|minor|patch|1.2.3]`);
    process.exit(1);
  }
  
  // Update package.json
  pkg.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}📝 Version Update${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(40)}${neon.reset}`);
  console.log();
  console.log(`  ${neon.dim}${currentVersion}${neon.reset} → ${neon.green}${newVersion}${neon.reset}`);
  console.log();
  console.log(`${neon.green}✓ Updated package.json${neon.reset}`);
  console.log();
}

main().catch(console.error);
