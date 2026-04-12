#!/usr/bin/env node
/**
 * Test Script - Run all game tests and validate the build
 * Usage: node scripts/test.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const tests = {
  'Package.json': () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    if (!pkg.name || !pkg.version || !pkg.main) {
      throw new Error('Missing required fields in package.json');
    }
    return `v${pkg.version}`;
  },
  
  'Main process': () => {
    const mainPath = path.join(projectRoot, 'main.js');
    if (!fs.existsSync(mainPath)) {
      throw new Error('main.js not found');
    }
    // Syntax check
    execSync(`node -c "${mainPath}"`, { stdio: 'pipe' });
    return 'OK';
  },
  
  'Preload script': () => {
    const preloadPath = path.join(projectRoot, 'preload.js');
    if (!fs.existsSync(preloadPath)) {
      throw new Error('preload.js not found');
    }
    return 'OK';
  },
  
  'Index.html': () => {
    const htmlPath = path.join(projectRoot, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      throw new Error('index.html not found');
    }
    const content = fs.readFileSync(htmlPath, 'utf8');
    if (!content.includes('<canvas')) {
      throw new Error('Missing canvas element');
    }
    return 'OK';
  },
  
  'Games folder': () => {
    const gamesDir = path.join(projectRoot, 'games');
    if (!fs.existsSync(gamesDir)) {
      throw new Error('games/ folder not found');
    }
    const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.js'));
    if (games.length === 0) {
      throw new Error('No game files found');
    }
    return `${games.length} games`;
  },
  
  'Renderer folder': () => {
    const rendererDir = path.join(projectRoot, 'renderer');
    if (!fs.existsSync(rendererDir)) {
      throw new Error('renderer/ folder not found');
    }
    const files = fs.readdirSync(rendererDir).filter(f => f.endsWith('.js'));
    if (files.length === 0) {
      throw new Error('No renderer files found');
    }
    return `${files.length} files`;
  },
  
  'Styles folder': () => {
    const stylesDir = path.join(projectRoot, 'styles');
    if (!fs.existsSync(stylesDir)) {
      throw new Error('styles/ folder not found');
    }
    const cssFiles = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));
    if (cssFiles.length === 0) {
      throw new Error('No CSS files found');
    }
    return `${cssFiles.length} files`;
  },
  
  'Assets folder': () => {
    const assetsDir = path.join(projectRoot, 'assets');
    if (!fs.existsSync(assetsDir)) {
      throw new Error('assets/ folder not found');
    }
    return 'OK';
  },
  
  'Node modules': () => {
    const modulesDir = path.join(projectRoot, 'node_modules');
    if (!fs.existsSync(modulesDir)) {
      throw new Error('node_modules not found - run npm install');
    }
    return 'OK';
  },
  
  'Electron binary': () => {
    const electronPath = path.join(projectRoot, 'node_modules', 'electron');
    if (!fs.existsSync(electronPath)) {
      throw new Error('Electron not installed');
    }
    return 'OK';
  },
  
  'Syntax check': () => {
    // Check all JS files for syntax errors
    const checkFile = (filePath) => {
      try {
        execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
      } catch (e) {
        throw new Error(`Syntax error in ${path.basename(filePath)}`);
      }
    };
    
    const jsFiles = [
      'main.js',
      'preload.js',
      'scripts/build.js',
    ];
    
    for (const file of jsFiles) {
      checkFile(path.join(projectRoot, file));
    }
    
    return 'All valid';
  },
};

async function main() {
  console.log();
  console.log(`${neon.cyan}${neon.bold}🧪 Lightning Games Test Suite${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, test] of Object.entries(tests)) {
    try {
      const result = test();
      console.log(`  ${neon.green}✓${neon.reset} ${name.padEnd(20)} ${neon.dim}${result}${neon.reset}`);
      passed++;
    } catch (e) {
      console.log(`  ${neon.red}✗${neon.reset} ${name.padEnd(20)} ${neon.red}${e.message}${neon.reset}`);
      failed++;
    }
  }
  
  console.log();
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  
  if (failed === 0) {
    console.log(`${neon.green}✓ All ${passed} tests passed!${neon.reset}`);
    console.log();
    process.exit(0);
  } else {
    console.log(`${neon.red}✗ ${failed} test(s) failed, ${passed} passed${neon.reset}`);
    console.log();
    process.exit(1);
  }
}

main().catch(console.error);
