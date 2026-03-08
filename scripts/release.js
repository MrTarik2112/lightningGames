#!/usr/bin/env node
/**
 * Release Script - Create a new release with version bump, changelog, and git tag
 * Usage: node scripts/release.js [major|minor|patch|version]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const neon = {
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;226m',
  red: '\x1b[38;5;196m',
  magenta: '\x1b[38;5;201m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return pkg.version;
}

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
      return type; // Assume it's a specific version
  }
  
  return parts.join('.');
}

function updatePackageVersion(newVersion) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
}

function generateChangelog(oldVersion, newVersion) {
  const date = new Date().toISOString().split('T')[0];
  
  try {
    const lastTag = `v${oldVersion}`;
    const changes = execSync(`git log ${lastTag}..HEAD --oneline --no-merges 2>/dev/null || git log -10 --oneline --no-merges`, { 
      encoding: 'utf8' 
    }).trim();
    
    const changelog = `# Lightning Games v${newVersion}

**Release Date:** ${date}

## Changes

${changes.split('\n').map(line => `- ${line}`).join('\n')}

## Installation

Download the latest release from the [Releases](../../releases) page.

---
*This release was generated automatically.*
`;
    
    const changelogPath = path.join(projectRoot, `RELEASE-v${newVersion}.md`);
    fs.writeFileSync(changelogPath, changelog);
    return changelogPath;
  } catch (e) {
    return null;
  }
}

function gitOperations(newVersion, changelogPath) {
  try {
    // Check if git repo
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    
    // Stage changes
    execSync('git add -A', { encoding: 'utf8' });
    
    // Commit
    execSync(`git commit -m "chore: release v${newVersion}"`, { encoding: 'utf8' });
    
    // Create tag
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { encoding: 'utf8' });
    
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, type);
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}🚀 Lightning Games Release${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  
  console.log(`  ${neon.dim}Current version:${neon.reset} ${currentVersion}`);
  console.log(`  ${neon.dim}New version:${neon.reset} ${neon.green}${newVersion}${neon.reset}`);
  console.log();
  
  // Update package.json
  updatePackageVersion(newVersion);
  console.log(`${neon.green}✓ Updated package.json${neon.reset}`);
  
  // Generate changelog
  const changelogPath = generateChangelog(currentVersion, newVersion);
  if (changelogPath) {
    console.log(`${neon.green}✓ Generated changelog: ${changelogPath}${neon.reset}`);
  }
  
  // Git operations
  if (gitOperations(newVersion, changelogPath)) {
    console.log(`${neon.green}✓ Created git commit and tag${neon.reset}`);
  } else {
    console.log(`${neon.yellow}⚠ Git operations skipped (not a git repo or no changes)${neon.reset}`);
  }
  
  console.log();
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log(`${neon.green}✓ Release v${newVersion} created!${neon.reset}`);
  console.log();
  console.log(`  Next steps:`);
  console.log(`    1. Run ${neon.cyan}npm run dist${neon.reset} to build`);
  console.log(`    2. Run ${neon.cyan}git push --tags${neon.reset} to publish`);
  console.log();
}

main().catch(console.error);
