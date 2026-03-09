#!/usr/bin/env node
/**
 * Package Manager Detection Utility
 * Detects and returns the best available package manager (Bun or npm)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const neon = {
  cyan: '\x1b[38;5;81m',
  green: '\x1b[38;5;78m',
  yellow: '\x1b[38;5;222m',
  red: '\x1b[38;5;210m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class PackageManagerDetector {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.bunAvailable = false;
    this.npmAvailable = false;
    this.bunVersion = null;
    this.npmVersion = null;
    this.preferredPM = null;
  }

  /**
   * Check if Bun is installed and get version
   */
  checkBun() {
    try {
      const version = execSync('bun --version', { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      this.bunVersion = version;
      this.bunAvailable = true;
      return true;
    } catch {
      this.bunAvailable = false;
      return false;
    }
  }

  /**
   * Check if npm is installed and get version
   */
  checkNpm() {
    try {
      const version = execSync('npm --version', { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      this.npmVersion = version;
      this.npmAvailable = true;
      return true;
    } catch {
      this.npmAvailable = false;
      return false;
    }
  }

  /**
   * Detect lockfile to determine which PM was used
   */
  detectLockfile() {
    const bunLock = path.join(this.projectRoot, 'bun.lockb');
    const npmLock = path.join(this.projectRoot, 'package-lock.json');
    
    if (fs.existsSync(bunLock)) return 'bun';
    if (fs.existsSync(npmLock)) return 'npm';
    return null;
  }

  /**
   * Get the preferred package manager
   */
  getPreferred() {
    // Check environment variable override
    const envPM = process.env.LIGHTNING_PM;
    if (envPM === 'bun' && this.bunAvailable) return 'bun';
    if (envPM === 'npm' && this.npmAvailable) return 'npm';

    // Check lockfile
    const lockfilePM = this.detectLockfile();
    if (lockfilePM === 'bun' && this.bunAvailable) return 'bun';
    if (lockfilePM === 'npm' && this.npmAvailable) return 'npm';

    // Prefer Bun if available (faster)
    if (this.bunAvailable) return 'bun';
    
    // Fallback to npm
    if (this.npmAvailable) return 'npm';

    return null;
  }

  /**
   * Get command for the preferred package manager
   */
  getCommand(action) {
    const pm = this.getPreferred();
    
    const commands = {
      bun: {
        install: 'bun install',
        add: 'bun add',
        remove: 'bun remove',
        run: 'bun run',
        exec: 'bunx',
        ci: 'bun install --frozen-lockfile',
      },
      npm: {
        install: 'npm install',
        add: 'npm install',
        remove: 'npm uninstall',
        run: 'npm run',
        exec: 'npx',
        ci: 'npm ci',
      }
    };

    return commands[pm]?.[action] || null;
  }

  /**
   * Get binary path for electron-builder
   */
  getBuilderPath() {
    const pm = this.getPreferred();
    const binDir = pm === 'bun' ? '.bin' : '.bin';
    const ext = process.platform === 'win32' ? '.cmd' : '';
    return path.join(this.projectRoot, 'node_modules', binDir, `electron-builder${ext}`);
  }

  /**
   * Get electron path
   */
  getElectronPath() {
    const ext = process.platform === 'win32' ? '.cmd' : '';
    return path.join(this.projectRoot, 'node_modules', '.bin', `electron${ext}`);
  }

  /**
   * Full detection and report
   */
  detect() {
    this.checkBun();
    this.checkNpm();
    this.preferredPM = this.getPreferred();

    return {
      bun: {
        available: this.bunAvailable,
        version: this.bunVersion,
      },
      npm: {
        available: this.npmAvailable,
        version: this.npmVersion,
      },
      preferred: this.preferredPM,
      lockfile: this.detectLockfile(),
    };
  }

  /**
   * Print detection results
   */
  printReport(verbose = false) {
    const report = this.detect();

    if (verbose) {
      console.log();
      console.log(`${neon.cyan}${neon.bold}Package Manager Detection${neon.reset}`);
      console.log(`${neon.dim}${'─'.repeat(40)}${neon.reset}`);
      console.log();

      // Bun status
      if (report.bun.available) {
        console.log(`  ${neon.green}✓ Bun${neon.reset}     v${report.bun.version}`);
      } else {
        console.log(`  ${neon.dim}✗ Bun     not installed${neon.reset}`);
      }

      // npm status
      if (report.npm.available) {
        console.log(`  ${neon.green}✓ npm${neon.reset}     v${report.npm.version}`);
      } else {
        console.log(`  ${neon.red}✗ npm     not installed${neon.reset}`);
      }

      console.log();

      // Lockfile
      if (report.lockfile) {
        console.log(`  Lockfile: ${neon.cyan}${report.lockfile === 'bun' ? 'bun.lockb' : 'package-lock.json'}${neon.reset}`);
      } else {
        console.log(`  Lockfile: ${neon.dim}none${neon.reset}`);
      }

      // Preferred
      if (report.preferred) {
        const icon = report.preferred === 'bun' ? '⚡' : '📦';
        console.log(`  Preferred: ${neon.green}${icon} ${report.preferred}${neon.reset}`);
      } else {
        console.log(`  ${neon.red}✗ No package manager available!${neon.reset}`);
      }

      console.log();
    }

    return report;
  }
}

// Export for use in other scripts
module.exports = PackageManagerDetector;

// CLI usage
if (require.main === module) {
  const detector = new PackageManagerDetector();
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log();
    console.log(`${neon.cyan}${neon.bold}Package Manager Detector${neon.reset}`);
    console.log();
    console.log(`  Usage: node scripts/detect-pm.js [options]`);
    console.log();
    console.log(`  Options:`);
    console.log(`    --verbose, -v    Show detailed report`);
    console.log(`    --json           Output as JSON`);
    console.log(`    --command <cmd>  Get command for action (install, run, etc.)`);
    console.log(`    --help, -h       Show this help`);
    console.log();
    console.log(`  Environment:`);
    console.log(`    LIGHTNING_PM     Force package manager (bun or npm)`);
    console.log();
    process.exit(0);
  }

  if (args.includes('--json')) {
    const report = detector.detect();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (args.includes('--command')) {
    const cmdIndex = args.indexOf('--command');
    const action = args[cmdIndex + 1];
    if (!action) {
      console.error(`${neon.red}Error: --command requires an action${neon.reset}`);
      process.exit(1);
    }
    const cmd = detector.getCommand(action);
    if (cmd) {
      console.log(cmd);
      process.exit(0);
    } else {
      console.error(`${neon.red}Error: Unknown action or no PM available${neon.reset}`);
      process.exit(1);
    }
  }

  const verbose = args.includes('--verbose') || args.includes('-v');
  const report = detector.printReport(verbose);

  if (!report.preferred) {
    console.error(`${neon.red}Error: No package manager available!${neon.reset}`);
    console.error(`${neon.yellow}Install Bun: https://bun.sh${neon.reset}`);
    console.error(`${neon.yellow}Or install npm: https://nodejs.org${neon.reset}`);
    process.exit(1);
  }

  process.exit(0);
}
