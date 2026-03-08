const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`\x1b[36m⚡ Lightning Games Build System\x1b[0m`);
console.log(`Current version: \x1b[33m${packageJson.version}\x1b[0m\n`);

(async () => {
  try {
    const newVersion = await question('Enter new version number (or press Enter to keep current): ');
    let versionUpdated = false;

    const normalizeVersion = (v) => {
      if (!v) return '';
      const s = v.trim();
      if (!s) return '';
      return s.startsWith('v') || s.startsWith('V') ? s.slice(1) : s;
    };

    const isValidSemver = (v) => {
      const semverRegex = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
      return semverRegex.test(v);
    };

    const normalizedVersion = normalizeVersion(newVersion);

    if (normalizedVersion) {
      if (isValidSemver(normalizedVersion)) {
        packageJson.version = normalizedVersion;
        versionUpdated = true;
        console.log(`\x1b[32m✓ Package version updated to ${packageJson.version}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✗ Invalid version: "${newVersion.trim()}". Keeping ${packageJson.version}\x1b[0m`);
      }
    } else {
      console.log(`\x1b[34mℹ Keeping version ${packageJson.version}\x1b[0m`);
    }

    console.log(`\n\x1b[36m--- Compression Level (0-10) ---\x1b[0m`);
    console.log(`\x1b[32m[0-3]  Fast\x1b[0m    - Est. Time: ~5-10s  | Est. Size: ~150MB`);
    console.log(`\x1b[33m[4-7]  Normal\x1b[0m  - Est. Time: ~30-60s | Est. Size: ~110MB`);
    console.log(`\x1b[31m[8-10] Maximum\x1b[0m - Est. Time: ~2-3m   | Est. Size: ~80MB`);

    const compInput = await question('\nEnter compression level [0-10] (default: 0): ');
    let compLevel = parseInt(compInput.trim());

    if (isNaN(compLevel) || compLevel < 0 || compLevel > 10) {
      compLevel = 0;
      console.log(`\x1b[34mℹ Invalid or empty input. Defaulting to level 0 (Fast).\x1b[0m`);
    }

    let compressionSetting = 'store';
    if (compLevel >= 8) {
      compressionSetting = 'maximum';
      console.log(`\x1b[31mℹ Setting compression to Maximum (Level ${compLevel}). Grab a coffee! ☕\x1b[0m`);
    } else if (compLevel >= 4) {
      compressionSetting = 'normal';
      console.log(`\x1b[33mℹ Setting compression to Normal (Level ${compLevel}).\x1b[0m`);
    } else {
      console.log(`\x1b[32mℹ Setting compression to Fast (Level ${compLevel}).\x1b[0m`);
    }

    if (!packageJson.build) packageJson.build = {};
    packageJson.build.compression = compressionSetting;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    const logDir = path.join(__dirname, '..', 'BuildLogs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logDir, `build-${timestamp}.log`);
    const logStream = fs.createWriteStream(logFile);

    console.log(`\n\x1b[34mℹ Logs will be saved to: BuildLogs/build-${timestamp}.log\x1b[0m`);
    console.log(`\x1b[35m🚀 Starting build process...\x1b[0m\n`);

    // Progress Bar configuration
    const barWidth = 30;
    let progress = 0;

    function updateProgressBar(percentage) {
      const filledWidth = Math.floor((percentage / 100) * barWidth);
      const emptyWidth = barWidth - filledWidth;
      const bar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`[\x1b[36m${bar}\x1b[0m] \x1b[33m${percentage}%\x1b[0m \x1b[2mProcessing... (Level ${compLevel})\x1b[0m`);
    }

    // Simulated progress while the real build happens
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      // Slower progress if compression is higher
      const maxSimulated = compressionSetting === 'maximum' ? 85 : 95;
      const increment = compressionSetting === 'maximum' ? Math.random() * 0.5 : Math.random() * 2;

      if (simulatedProgress < maxSimulated) {
        simulatedProgress += increment;
        updateProgressBar(Math.floor(simulatedProgress));
      }
    }, 1000);

    // Execute electron-builder locally
    const builderPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron-builder.cmd');
    const builder = spawn(builderPath, ['--win', 'portable'], {
      shell: true,
      cwd: path.join(__dirname, '..')
    });

    builder.stdout.on('data', (data) => {
      logStream.write(data);
      const output = data.toString();
      if (output.includes('packaging')) simulatedProgress = Math.max(simulatedProgress, 40);
      if (output.includes('building')) simulatedProgress = Math.max(simulatedProgress, 60);
      if (output.includes('signing')) simulatedProgress = Math.max(simulatedProgress, 80);
    });

    builder.stderr.on('data', (data) => {
      logStream.write(data);
    });

    builder.on('close', (code) => {
      clearInterval(progressInterval);
      if (code === 0) {
        updateProgressBar(100);
        console.log(`\n\n\x1b[32m✅ Build completed successfully!\x1b[0m`);
      } else {
        console.log(`\n\n\x1b[31m❌ Build failed with exit code ${code}\x1b[0m`);
        console.log(`\x1b[2mCheck the log for details: ${logFile}\x1b[0m`);
      }
      logStream.end();
      rl.close();
    });

  } catch (err) {
    console.error(`\n\x1b[31m❌ Error during build setup: ${err.message}\x1b[0m`);
    rl.close();
  }
})();
