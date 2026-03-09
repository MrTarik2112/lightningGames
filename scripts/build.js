const { spawn, execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// ===================== CONFIGURATION =====================
const CONFIG = {
  projectName: 'lightning-games',
  displayName: 'Lightning Games',
  cacheDir: path.join(os.homedir(), '.cache', 'lightning-games-build'),
  maxCacheAge: 7 * 24 * 60 * 60 * 1000,
  maxRetries: 3,
  retryDelay: 3000,
  parallelBuilds: true,
  wslDistro: 'Ubuntu',
  dockerImage: 'electronuserland/builder:wine',
  buildTimeout: 30 * 60 * 1000,
  postBuildTest: true,
  artifactDir: 'dist',
  logDir: 'BuildLogs',
};

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const EOL = process.platform === 'win32' ? '\r\n' : '\n';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';
const isMac = process.platform === 'darwin';

// ===================== NEON COLOR PALETTE (Muted) =====================
const neon = {
  cyan: '\x1b[38;5;81m',      // Softer cyan (was 51)
  magenta: '\x1b[38;5;177m',  // Softer magenta (was 201)
  green: '\x1b[38;5;78m',     // Softer green (was 46)
  yellow: '\x1b[38;5;222m',   // Softer yellow (was 226)
  orange: '\x1b[38;5;215m',   // Softer orange (was 208)
  purple: '\x1b[38;5;147m',   // Softer purple (was 141)
  blue: '\x1b[38;5;117m',     // Softer blue (was 75)
  red: '\x1b[38;5;210m',      // Softer red (was 196)
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  white: '\x1b[38;5;254m',    // Softer white (was 255)
  gray: '\x1b[38;5;245m',     // Slightly lighter gray (was 240)
};

// ===================== ICONS =====================
const icons = {
  lightning: '⚡',
  check: '✓',
  cross: '✗',
  arrow: '→',
  bullet: '•',
  star: '★',
  folder: '📁',
  package: '📦',
  rocket: '🚀',
  gear: '⚙',
  info: 'ℹ',
  warning: '⚠',
  linux: '🐧',
  windows: '🪟',
  docker: '🐳',
  git: '📝',
  clock: '⏱',
  chart: '📊',
};

// ===================== LOGGER =====================
const log = {
  _indent: 0,
  indent() { this._indent++; return this; },
  outdent() { this._indent--; return this; },
  _pad() { return '  '.repeat(this._indent); },

  info(msg) {
    console.log(`${this._pad()}${neon.blue}${icons.info}${neon.reset} ${msg}`);
    return this;
  },

  success(msg) {
    console.log(`${this._pad()}${neon.green}${icons.check}${neon.reset} ${neon.green}${msg}${neon.reset}`);
    return this;
  },

  error(msg) {
    console.log(`${this._pad()}${neon.red}${icons.cross}${neon.reset} ${neon.red}${msg}${neon.reset}`);
    return this;
  },

  warning(msg) {
    console.log(`${this._pad()}${neon.yellow}${icons.warning}${neon.reset} ${neon.yellow}${msg}${neon.reset}`);
    return this;
  },

  step(msg) {
    console.log(`${this._pad()}${neon.magenta}${icons.arrow}${neon.reset} ${msg}`);
    return this;
  },

  section(title, subtitle = '') {
    console.log();
    console.log(`${this._pad()}${neon.cyan}${neon.bold}╔══ ${title} ══${subtitle ? ` ${subtitle} ` : ''}╗${neon.reset}`);
    return this;
  },

  subsection(title) {
    console.log();
    console.log(`${this._pad()}${neon.purple}${icons.bullet} ${title}${neon.reset}`);
    return this;
  },
};

// ===================== PROGRESS BAR =====================
class NeonProgress {
  constructor(total, width = 50) {
    this.total = total;
    this.current = 0;
    this.width = width;
    this.startTime = Date.now();
    this.lastUpdate = 0;
  }

  update(current, message = '') {
    const now = Date.now();
    if (now - this.lastUpdate < 100 && current < this.total) return this;
    this.lastUpdate = now;
    this.current = current;

    const pct = Math.floor((current / this.total) * 100);
    const filled = Math.floor((pct / 100) * this.width);
    const empty = this.width - filled;

    const bar = `${neon.cyan}${'█'.repeat(filled)}${neon.dim}${'░'.repeat(empty)}${neon.reset}`;

    const elapsed = Date.now() - this.startTime;
    const rate = current / elapsed;
    const remaining = this.total - current;
    const eta = rate > 0 ? Math.ceil(remaining / rate / 1000) : 0;
    const etaStr = eta > 0 ? `ETA: ${this._formatTime(eta)}` : '';

    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`  [${bar}] ${neon.yellow}${neon.bold}${pct}%${neon.reset} ${neon.dim}${message} ${etaStr}${neon.reset}   `);

    return this;
  }

  _formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m${s}s`;
  }

  complete(message = 'Complete!') {
    this.update(this.total, message);
    console.log();
    return this;
  }
}

// ===================== FILE UTILITIES =====================
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function getDirectoryHash(dirPath, exclude = ['node_modules', 'dist', '.git', 'BuildLogs', '.cache']) {
  const files = [];
  function walkDir(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        if (exclude.includes(item) || item.startsWith('.')) continue;
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) walkDir(fullPath);
        else files.push({ path: fullPath, mtime: stat.mtime, size: stat.size });
      }
    } catch {}
  }
  try {
    walkDir(dirPath);
    files.sort((a, b) => a.path.localeCompare(b.path));
    return crypto.createHash('md5').update(files.map(f => `${f.path}:${f.mtime.getTime()}:${f.size}`).join('|')).digest('hex');
  } catch { return null; }
}

// ===================== BUILD CACHE =====================
class BuildCache {
  constructor() {
    this.cacheDir = CONFIG.cacheDir;
    this.metadataFile = path.join(this.cacheDir, 'metadata.json');
    this.nodeModulesCacheDir = path.join(this.cacheDir, 'node_modules');
    this.electronCacheDir = path.join(this.cacheDir, 'electron');
    this.ensureCacheDir();
    this.metadata = this.loadMetadata();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir, { recursive: true });
    if (!fs.existsSync(this.nodeModulesCacheDir)) fs.mkdirSync(this.nodeModulesCacheDir, { recursive: true });
    if (!fs.existsSync(this.electronCacheDir)) fs.mkdirSync(this.electronCacheDir, { recursive: true });
  }

  loadMetadata() {
    try {
      if (fs.existsSync(this.metadataFile)) return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
    } catch {}
    return { caches: {}, stats: { hits: 0, misses: 0 }, lastBuild: null, lastHash: null };
  }

  saveMetadata() {
    try { fs.writeFileSync(this.metadataFile, JSON.stringify(this.metadata, null, 2)); } catch {}
  }

  getStats() {
    const stats = { totalSize: 0, cacheCount: 0, hits: this.metadata.stats.hits, misses: this.metadata.stats.misses, hitRate: '0%' };
    if (fs.existsSync(this.cacheDir)) {
      const walk = (dir) => {
        let size = 0;
        try {
          for (const item of fs.readdirSync(dir)) {
            const p = path.join(dir, item);
            const s = fs.statSync(p);
            size += s.isDirectory() ? walk(p) : s.size;
          }
        } catch {}
        return size;
      };
      stats.totalSize = formatBytes(walk(this.cacheDir));
      stats.cacheCount = Object.keys(this.metadata.caches).length;
    }
    const total = stats.hits + stats.misses;
    if (total > 0) stats.hitRate = Math.round((stats.hits / total) * 100) + '%';
    return stats;
  }

  clear() {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true, force: true });
      fs.mkdirSync(this.cacheDir, { recursive: true });
      fs.mkdirSync(this.nodeModulesCacheDir, { recursive: true });
      fs.mkdirSync(this.electronCacheDir, { recursive: true });
      this.metadata = { caches: {}, stats: { hits: 0, misses: 0 }, lastBuild: null, lastHash: null };
      this.saveMetadata();
    }
  }

  // Check if rebuild is needed based on source hash
  needsRebuild() {
    const currentHash = getDirectoryHash(projectRoot);
    const lastHash = this.metadata.lastHash;
    if (currentHash !== lastHash) {
      this.metadata.lastHash = currentHash;
      this.saveMetadata();
      return true;
    }
    return false;
  }

  // Get cached node_modules path
  getNodeModulesCachePath() {
    return this.nodeModulesCacheDir;
  }

  // Get Electron cache path
  getElectronCachePath() {
    return this.electronCacheDir;
  }
}

const buildCache = new BuildCache();

// ===================== PLATFORM DETECTION =====================
function hasWSL() {
  if (!isWindows) return false;
  try { execSync('wsl --list', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }); return true; }
  catch { return false; }
}

function hasDocker() {
  try { execSync('docker --version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }); return true; }
  catch { return false; }
}

// ===================== COMPRESSION PRESETS =====================
const COMPRESSION_PRESETS = {
  0: { name: 'Store', level: 'store', time: '~5s', size: '~140MB', desc: 'No compression', color: 'dim', icon: '📦' },
  1: { name: 'Fast', level: 'normal', time: '~20s', size: '~125MB', desc: 'Quick build', color: 'green', icon: '⚡' },
  2: { name: 'Light', level: 'normal', time: '~35s', size: '~115MB', desc: 'Light compression', color: 'cyan', icon: '🔹' },
  3: { name: 'Medium', level: 'normal', time: '~50s', size: '~105MB', desc: 'Balanced', color: 'blue', icon: '⚖' },
  4: { name: 'Good', level: 'maximum', time: '~70s', size: '~95MB', desc: 'Good compression', color: 'purple', icon: '💎' },
  5: { name: 'High', level: 'maximum', time: '~90s', size: '~85MB', desc: 'High compression', color: 'magenta', icon: '🔥' },
  6: { name: 'Higher', level: 'maximum', time: '~2m', size: '~75MB', desc: 'Higher compression', color: 'orange', icon: '🚀' },
  7: { name: 'Ultra', level: 'maximum', time: '~3m', size: '~65MB', desc: 'Ultra compression', color: 'yellow', icon: '⭐' },
  8: { name: 'Extreme', level: 'maximum', time: '~5m', size: '~55MB', desc: 'Extreme compression', color: 'red', icon: '💪' },
  9: { name: 'Insane', level: 'maximum', time: '~8m', size: '~45MB', desc: 'Insane compression', color: 'red', icon: '🔥' },
  10: { name: 'MaxComp', level: 'maximum', time: '~15m', size: '~35MB', desc: 'MAXIMUM COMPRESSION', color: 'magenta', icon: '👑' }
};

function getCompressionConfig(level) {
  const preset = COMPRESSION_PRESETS[level] || COMPRESSION_PRESETS[5];
  return { setting: preset.level, level, ...preset };
}

function renderCompressionBar(level) {
  const width = 20;
  const filled = Math.round((level / 10) * width);
  const empty = width - filled;
  const colors = ['gray', 'green', 'cyan', 'blue', 'purple', 'magenta', 'orange', 'yellow', 'red', 'red', 'magenta'];
  const color = neon[colors[level]] || neon.cyan;
  return `${color}${'█'.repeat(filled)}${neon.dim}${'░'.repeat(empty)}${neon.reset}`;
}

// ===================== WSL DEPENDENCIES =====================
const WSL_PACKAGES = [
  'libnss3', 'libatk1.0-0', 'libatk-bridge2.0-0', 'libcups2', 'libdrm2',
  'libxkbcommon0', 'libxcomposite1', 'libxdamage1', 'libxfixes3', 'libxrandr2',
  'libgbm1', 'libpango-1.0-0', 'libcairo2', 'libasound2', 'libgtk-3-0',
  'libnotify4', 'libxss1', 'libxtst6', 'libatspi2.0-0', 'libuuid1', 'libsecret-1-0'
];

async function checkWSLDependencies() {
  log.step('Checking WSL dependencies...');
  try {
    const result = execSync(`wsl bash -c "dpkg -l ${WSL_PACKAGES.join(' ')} 2>/dev/null | grep -c '^ii' || echo 0"`, { encoding: 'utf8' });
    const installed = parseInt(result.trim());
    if (installed < WSL_PACKAGES.length) {
      log.warning(`${WSL_PACKAGES.length - installed} packages missing`);
      const answer = await question(`  ${neon.yellow}Install missing dependencies?${neon.reset} [Y/n]: `);
      if (answer.toLowerCase() !== 'n') {
        log.step('Installing WSL dependencies...');
        execSync(`wsl bash -c "sudo apt-get update && sudo apt-get install -y ${WSL_PACKAGES.join(' ')}"`, { encoding: 'utf8', stdio: 'inherit' });
        log.success('Dependencies installed');
        return true;
      }
      return false;
    }
    log.success('All WSL dependencies installed');
    return true;
  } catch (e) {
    log.warning(`Could not check WSL dependencies: ${e.message}`);
    return false;
  }
}

// ===================== BUILD EXECUTORS =====================
class BuildExecutor {
  constructor(platform, config, logStream) {
    this.platform = platform;
    this.config = config;
    this.logStream = logStream;
    this.startTime = null;
    this.endTime = null;
    this.attempts = 0;
    this.logBuffer = [];
  }

  async execute() {
    this.startTime = Date.now();
    this.logWrite(`\n[${new Date().toISOString()}] Starting ${this.platform} build...`);
    while (this.attempts < CONFIG.maxRetries) {
      this.attempts++;
      try {
        log.step(`Build attempt ${this.attempts}/${CONFIG.maxRetries}...`);
        const result = await this.runBuild();
        this.endTime = Date.now();
        this.logWrite(`\n[${new Date().toISOString()}] Build SUCCESS - Duration: ${formatDuration(this.endTime - this.startTime)}`);
        return { success: true, duration: this.endTime - this.startTime, logs: this.logBuffer.join('\n'), ...result };
      } catch (error) {
        this.logWrite(`\n[${new Date().toISOString()}] Build FAILED: ${error.message}`);
        log.error(`Build failed: ${error.message}`);
        if (this.attempts < CONFIG.maxRetries) {
          log.warning(`Retrying in ${CONFIG.retryDelay / 1000} seconds...`);
          await this.sleep(CONFIG.retryDelay);
        }
      }
    }
    this.endTime = Date.now();
    throw new Error(`Build failed after ${CONFIG.maxRetries} attempts`);
  }

  sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  log(msg) { this.logBuffer.push(msg); }
  logWrite(msg) { if (this.logStream) this.logStream.write(msg); }
  async runBuild() { throw new Error('Must implement runBuild'); }
}

class WindowsBuildExecutor extends BuildExecutor {
  async runBuild() {
    log.step(`${icons.windows} Starting Windows build...`);
    this.logWrite(`\n  Platform: Windows Portable`);
    this.logWrite(`\n  Compression: ${this.config.compression.name} (${this.config.compression.setting})`);
    
    // Set up environment with cache paths
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      ELECTRON_CACHE: buildCache.getElectronCachePath(),
      ELECTRON_BUILDER_CACHE: buildCache.getElectronCachePath(),
      npm_config_prefer_offline: 'true',
      npm_config_no_audit: 'true',
      npm_config_progress: 'false'
    };

    const builderPath = path.join(projectRoot, 'node_modules', '.bin', 'electron-builder.cmd');
    const args = ['--win', 'portable', '--config.compression', this.config.compression.setting];

    return new Promise((resolve, reject) => {
      const proc = spawn(builderPath, args, { shell: true, cwd: projectRoot, env });
      let stdout = '', stderr = '';
      const progress = new NeonProgress(100);

      proc.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        this.log(output);
        this.logWrite(output);
        if (output.includes('packaging')) progress.update(20, 'Packaging...');
        if (output.includes('downloading')) progress.update(40, 'Downloading Electron...');
        if (output.includes('downloaded')) progress.update(60, 'Download complete');
        if (output.includes('building')) progress.update(80, 'Building...');
      });

      proc.stderr.on('data', (data) => { 
        const output = data.toString();
        stderr += output; 
        this.log(output);
        this.logWrite(output);
      });
      proc.on('close', (code) => {
        progress.complete();
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code });
        } else {
          reject(new Error(`Exit code ${code}: ${stderr}`));
        }
      });
      proc.on('error', reject);
    });
  }
}

class WSLBuildExecutor extends BuildExecutor {
  async runBuild() {
    log.step(`${icons.linux} Starting WSL Linux build...`);
    this.logWrite(`\n  Platform: Linux AppImage (WSL)`);
    this.logWrite(`\n  Compression: ${this.config.compression.name} (${this.config.compression.setting})`);
    await checkWSLDependencies();

    const wslSourcePath = `/mnt/c${projectRoot.substring(2).replace(/\\/g, '/')}`;
    const linuxBuildPath = `~/lightning-games-build-${Date.now()}`;
    const cachePath = `~/.cache/${CONFIG.projectName}`;

    const commands = [
      `echo "🐧 Starting Linux build in WSL..."`,
      `export DEBIAN_FRONTEND=noninteractive`,
      `export ELECTRON_CACHE=~/.cache/electron`,
      `export ELECTRON_BUILDER_CACHE=~/.cache/electron-builder`,
      `export npm_config_prefer_offline=true`,
      `export npm_config_no_audit=true`,
      `export npm_config_progress=false`,
      `export npm_config_loglevel=error`,
      `rm -rf "${linuxBuildPath}"`,
      `mkdir -p "${linuxBuildPath}"`,
      `mkdir -p "${cachePath}"`,
      `echo "📂 Copying project to Linux filesystem..."`,
      `rsync -aW --inplace --exclude='node_modules' --exclude='dist' --exclude='BuildLogs' --exclude='.git' --exclude='.cache' --exclude='.crush' "${wslSourcePath}/" "${linuxBuildPath}/" 2>&1 | head -5`,
      `if [ -d "${cachePath}/node_modules" ]; then echo "📦 Restoring cached node_modules..."; cp -r "${cachePath}/node_modules" "${linuxBuildPath}/"; fi`,
      `cd "${linuxBuildPath}"`,
      `echo "📥 Installing dependencies (parallel)..."`,
      `/usr/bin/npm ci --no-optional --prefer-offline --no-fund --no-audit 2>&1 | tail -5`,
      `echo "🔨 Building AppImage..."`,
      `/usr/bin/npx electron-builder@24.13.3 --linux AppImage --config.compression=${this.config.compression.setting} 2>&1 | grep -E "(packaging|building|complete|error|failed)" || true`,
      `echo "💾 Caching node_modules for future builds..."`,
      `rm -rf "${cachePath}/node_modules"`,
      `cp -r "${linuxBuildPath}/node_modules" "${cachePath}/" 2>/dev/null || true`,
      `echo "📋 Copying artifacts to Windows..."`,
      `mkdir -p "${wslSourcePath}/dist"`,
      `find "${linuxBuildPath}/dist" -name "*.AppImage" -exec cp -v {} "${wslSourcePath}/dist/" \\; 2>&1 | head -5`,
      `rm -rf "${linuxBuildPath}"`,
      `echo "✅ Linux build complete!"`
    ];

    return new Promise((resolve, reject) => {
      const proc = spawn('wsl', ['bash', '-c', commands.join(' && ')], { cwd: projectRoot, env: { ...process.env, NODE_ENV: 'production' } });
      let stdout = '', stderr = '';

      proc.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        this.log(output);
        this.logWrite(output);
        if (output.includes('Copying project')) log.step('Copying project to Linux filesystem...');
        if (output.includes('Restoring cached')) log.step('Restoring cached node_modules...');
        if (output.includes('Installing dependencies')) log.step('Installing dependencies (parallel)...');
        if (output.includes('Building AppImage')) log.step('Building AppImage...');
        if (output.includes('Caching node_modules')) log.step('Caching node_modules...');
        if (output.includes('Copying artifacts')) log.step('Copying artifacts to Windows...');
        process.stdout.write(output);
      });

      proc.stderr.on('data', (data) => { 
        const output = data.toString();
        stderr += output; 
        this.log(output);
        this.logWrite(output);
      });
      proc.on('close', (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`WSL build failed: ${code}\n${stderr}`)));
      proc.on('error', (err) => reject(new Error(`Failed to start WSL: ${err.message}`)));
    });
  }
}

class DockerBuildExecutor extends BuildExecutor {
  async runBuild() {
    log.step(`${icons.docker} Starting Docker Linux build...`);
    this.logWrite(`\n  Platform: Linux AppImage (Docker)`);
    this.logWrite(`\n  Compression: ${this.config.compression.name} (${this.config.compression.setting})`);
    const containerName = `${CONFIG.projectName}-build-${Date.now()}`;
    const dockerCmd = `docker run --rm --name "${containerName}" -v "${projectRoot}:/project" -w /project -e NODE_ENV=production -e npm_config_prefer_offline=true -e npm_config_no_audit=true -e npm_config_progress=false ${CONFIG.dockerImage} bash -c "npm ci --no-optional --prefer-offline && npx electron-builder --linux AppImage --config.compression=${this.config.compression.setting}"`;

    return new Promise((resolve, reject) => {
      const proc = spawn('docker', dockerCmd.split(' '), { shell: true, cwd: projectRoot });
      let stdout = '', stderr = '';

      proc.stdout.on('data', (data) => { 
        const output = data.toString();
        stdout += output; 
        this.log(output);
        this.logWrite(output);
        process.stdout.write(output); 
      });
      proc.stderr.on('data', (data) => { 
        const output = data.toString();
        stderr += output; 
        this.log(output);
        this.logWrite(output);
      });
      proc.on('close', (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`Docker build failed: ${code}`)));
      proc.on('error', (err) => reject(new Error(`Failed to start Docker: ${err.message}`)));
    });
  }
}

class LinuxNativeBuildExecutor extends BuildExecutor {
  async runBuild() {
    log.step(`${icons.linux} Starting native Linux build...`);
    this.logWrite(`\n  Platform: Linux AppImage (Native)`);
    this.logWrite(`\n  Compression: ${this.config.compression.name} (${this.config.compression.setting})`);
    
    // Set up environment with cache paths and optimizations
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      ELECTRON_CACHE: buildCache.getElectronCachePath(),
      ELECTRON_BUILDER_CACHE: buildCache.getElectronCachePath(),
      npm_config_prefer_offline: 'true',
      npm_config_no_audit: 'true',
      npm_config_progress: 'false',
      npm_config_loglevel: 'error'
    };

    const builderPath = path.join(projectRoot, 'node_modules', '.bin', 'electron-builder');
    const args = ['--linux', 'AppImage', '--config.compression', this.config.compression.setting];

    return new Promise((resolve, reject) => {
      const proc = spawn(builderPath, args, { shell: true, cwd: projectRoot, env });
      let stdout = '', stderr = '';

      proc.stdout.on('data', (data) => { 
        const output = data.toString();
        stdout += output; 
        this.log(output);
        this.logWrite(output);
        process.stdout.write(output); 
      });
      proc.stderr.on('data', (data) => { 
        const output = data.toString();
        stderr += output; 
        this.log(output);
        this.logWrite(output);
      });
      proc.on('close', (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`Exit code ${code}: ${stderr}`)));
      proc.on('error', reject);
    });
  }
}

// ===================== PARALLEL BUILDS =====================
async function runParallelBuilds(buildConfigs, logStream) {
  if (!CONFIG.parallelBuilds || buildConfigs.length === 1) {
    const results = [];
    for (const config of buildConfigs) {
      const result = await executeBuild(config, logStream);
      results.push(result);
    }
    return results;
  }
  log.section('Parallel Builds', `Running ${buildConfigs.length} builds simultaneously`);
  return Promise.all(buildConfigs.map(config => executeBuild(config, logStream)));
}

async function executeBuild(config, logStream) {
  const executors = {
    'windows': WindowsBuildExecutor,
    'linux-wsl': WSLBuildExecutor,
    'linux-docker': DockerBuildExecutor,
    'linux': LinuxNativeBuildExecutor
  };
  const ExecutorClass = executors[config.platform] || WindowsBuildExecutor;
  return new ExecutorClass(config.platform, config, logStream).execute();
}

// ===================== ARTIFACT MANAGER =====================
function collectArtifacts() {
  const distDir = path.join(projectRoot, 'dist');
  const artifacts = [];
  if (fs.existsSync(distDir)) {
    for (const file of fs.readdirSync(distDir)) {
      if (file.endsWith('.exe') || file.endsWith('.AppImage') || file.endsWith('.dmg')) {
        const filePath = path.join(distDir, file);
        const stat = fs.statSync(filePath);
        artifacts.push({ name: file, path: filePath, size: stat.size, sizeFormatted: formatBytes(stat.size), modified: stat.mtime });
      }
    }
  }
  return artifacts;
}

// ===================== MAIN =====================
async function main() {
  const startTime = Date.now();

  // ===================== HEADER =====================
  console.log();
  console.log(`${neon.cyan}${neon.bold}  Lightning Games Build System v5.7${neon.reset}`);
  console.log(`${neon.dim}  ${'─'.repeat(50)}${neon.reset}`);
  console.log();

  // System info
  const cacheStats = buildCache.getStats();
  console.log();
  log.info(`Version: ${neon.yellow}${packageJson.version}${neon.reset} | Platform: ${neon.cyan}${process.platform}${neon.reset} | Node: ${neon.green}${process.version}${neon.reset} | Cache: ${neon.magenta}${cacheStats.totalSize}${neon.reset}`);

  try {
    // ===================== VERSION =====================
    log.section('Version Configuration');

    const versionInput = await question(`  ${neon.cyan}Enter new version${neon.reset} (current: ${neon.yellow}${packageJson.version}${neon.reset}): `);
    const normalizedVersion = versionInput.trim().replace(/^[vV]/, '');
    let newVersion = packageJson.version;

    if (normalizedVersion && /^\d+\.\d+\.\d+/.test(normalizedVersion)) {
      newVersion = normalizedVersion;
      packageJson.version = newVersion;
      log.success(`Version updated to ${neon.yellow}${newVersion}${neon.reset}`);
    } else if (normalizedVersion) {
      log.error(`Invalid version format: "${versionInput.trim()}"`);
      log.info(`Keeping version ${packageJson.version}`);
    } else {
      log.info(`Keeping version ${packageJson.version}`);
    }

    // ===================== PLATFORM =====================
    log.section('Target Platforms');

    let selectedPlatforms = [];

    if (isWindows) {
      console.log();
      console.log(`  ${neon.bold}[1]${neon.reset} ${icons.windows}  Windows Portable       ${neon.dim}Single .exe file${neon.reset}`);
      console.log(`  ${neon.bold}[2]${neon.reset} ${icons.linux}  Linux AppImage (WSL)   ${!hasWSL() ? neon.dim + '[not available]' : neon.dim + 'Via WSL'}${neon.reset}`);
      console.log(`  ${neon.bold}[3]${neon.reset} ${icons.docker}  Linux AppImage (Docker)${!hasDocker() ? neon.dim + '[not available]' : neon.dim + 'Via Docker'}${neon.reset}`);
      console.log(`  ${neon.bold}[4]${neon.reset} ⚡  All Available         ${neon.dim}Parallel build${neon.reset}`);
      console.log(`  ${neon.bold}[5]${neon.reset} 🚀  Windows + WSL        ${neon.dim}Parallel build${neon.reset}`);

      const input = await question(`\n  ${neon.cyan}Select platform${neon.reset} [1-5] (default: 1): `);

      switch (input.trim()) {
        case '1': case '': selectedPlatforms = ['windows']; break;
        case '2': selectedPlatforms = hasWSL() ? ['linux-wsl'] : (log.error('WSL not available'), ['windows']); break;
        case '3': selectedPlatforms = hasDocker() ? ['linux-docker'] : (log.error('Docker not available'), ['windows']); break;
        case '4':
          selectedPlatforms = ['windows'];
          if (hasWSL()) selectedPlatforms.push('linux-wsl');
          if (hasDocker()) selectedPlatforms.push('linux-docker');
          break;
        case '5':
          selectedPlatforms = ['windows'];
          if (hasWSL()) selectedPlatforms.push('linux-wsl');
          break;
        default: selectedPlatforms = ['windows'];
      }
    } else if (isLinux) {
      console.log();
      console.log(`  ${neon.bold}[1]${neon.reset} ${icons.linux}  Linux AppImage    ${neon.dim}Portable .AppImage${neon.reset}`);
      console.log(`  ${neon.bold}[2]${neon.reset} ${icons.package}  Linux DEB package ${neon.dim}Installable .deb${neon.reset}`);
      console.log(`  ${neon.bold}[3]${neon.reset} ⚡  Both              ${neon.dim}Build both formats${neon.reset}`);

      const input = await question(`\n  ${neon.cyan}Select platform${neon.reset} [1-3] (default: 1): `);
      switch (input.trim()) {
        case '1': case '': selectedPlatforms = ['linux']; break;
        case '2': selectedPlatforms = ['linux-deb']; break;
        case '3': selectedPlatforms = ['linux', 'linux-deb']; break;
        default: selectedPlatforms = ['linux'];
      }
    }

    log.success(`Selected: ${selectedPlatforms.map(p => neon.cyan + p + neon.reset).join(', ')}`);

    // ===================== COMPRESSION =====================
    log.section('Compression Settings');

    console.log();
    console.log(`  ${neon.dim}Lvl  Name      Time      Size       Visual               Description${neon.reset}`);
    console.log(`  ${neon.dim}${'─'.repeat(75)}${neon.reset}`);

    Object.entries(COMPRESSION_PRESETS).forEach(([level, preset]) => {
      const color = neon[preset.color] || neon.white;
      const bar = renderCompressionBar(parseInt(level));
      const lvl = level.padStart(2);
      const name = preset.name.padEnd(9);
      const time = preset.time.padEnd(9);
      const size = preset.size.padEnd(10);
      const desc = level === '10' ? `${neon.magenta}${preset.desc}${neon.reset}` : preset.desc;
      console.log(`  ${neon.dim}${lvl}${neon.reset}   ${color}${name}${neon.reset} ${time} ${size} ${bar}  ${desc}`);
    });

    console.log();
    console.log(`  ${neon.dim}Tip: Level 3-4 is recommended for best balance${neon.reset}`);
    console.log(`  ${neon.dim}Tip: Level 10 (MaxComp) creates ~35MB ultra-compressed builds${neon.reset}`);

    const compInput = await question(`\n  ${neon.cyan}Enter compression level${neon.reset} [0-10] ${neon.dim}(default: 3)${neon.reset}: `);
    const parsed = parseInt(compInput.trim());
    const compLevel = isNaN(parsed) ? 3 : Math.min(10, Math.max(0, parsed));
    const compression = getCompressionConfig(compLevel);

    console.log();
    log.success(`Selected: ${compression.icon} ${compression.name} (Level ${compLevel})`);
    log.info(`Build time: ${neon.dim}${compression.time}${neon.reset} | Expected size: ${neon.dim}${compression.size}${neon.reset}`);
    if (compLevel === 10) {
      log.warning(`MaxComp mode enabled! This will take time but creates tiny builds.`);
    }

    // Update package.json
    if (!packageJson.build) packageJson.build = {};
    packageJson.build.compression = compression.setting;
    if (!packageJson.build.linux) packageJson.build.linux = { target: 'AppImage', icon: 'assets/icon.png', category: 'Game', maintainer: 'Tarik' };
    if (!packageJson.build.win) packageJson.build.win = { target: 'portable', icon: 'assets/icon.ico' };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + EOL);

    // ===================== CLEAN DIST =====================
    log.step('Cleaning dist folder...');
    const distDir = path.join(projectRoot, 'dist');
    if (fs.existsSync(distDir)) {
      try {
        // Try to remove locked files on Windows
        if (isWindows) {
          try {
            execSync(`rmdir /s /q "${distDir}"`, { stdio: 'pipe' });
          } catch {
            // If that fails, try force delete
            fs.rmSync(distDir, { recursive: true, force: true });
          }
        } else {
          fs.rmSync(distDir, { recursive: true, force: true });
        }
        log.success('Dist folder cleaned');
      } catch (e) {
        log.warning(`Could not clean dist: ${e.message}`);
        log.warning('Make sure the app is not running!');
      }
    }
    fs.mkdirSync(distDir, { recursive: true });

    // ===================== PRE-BUILD OPTIMIZATION =====================
    log.section('Pre-Build Optimization');
    
    // Check if rebuild is needed
    const needsRebuild = buildCache.needsRebuild();
    if (!needsRebuild && fs.existsSync(path.join(projectRoot, 'node_modules'))) {
      log.success('Source code unchanged - using cached dependencies');
      buildCache.metadata.stats.hits++;
    } else {
      log.info('Source code changed or first build - will reinstall dependencies');
      buildCache.metadata.stats.misses++;
    }
    buildCache.saveMetadata();

    // ===================== BUILD LOG =====================
    const logDir = path.join(projectRoot, CONFIG.logDir);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logDir, `build-${timestamp}.log`);
    const logStream = fs.createWriteStream(logFile);

    logStream.write(`=== ${CONFIG.displayName} Build Log ===\nVersion: ${newVersion}\nPlatforms: ${selectedPlatforms.join(', ')}\nCompression: ${compression.name}\nDate: ${new Date().toISOString()}\n${'='.repeat(60)}\n\n`);
    log.info(`Build log: ${neon.dim}${logFile}${neon.reset}`);

    // ===================== EXECUTE BUILDS =====================
    log.section('Building');

    // Force WSL for any linux builds on Windows
    const normalizedPlatforms = selectedPlatforms.map(p => {
      if (isWindows && (p === 'linux' || p === 'linux-appimage')) {
        log.warning(`Platform "${p}" requires Linux - redirecting to WSL`);
        return 'linux-wsl';
      }
      return p;
    });

    const buildConfigs = normalizedPlatforms.map(platform => ({ platform, compression, version: newVersion }));
    const buildStartTime = Date.now();
    const results = await runParallelBuilds(buildConfigs, logStream);
    const buildDuration = Date.now() - buildStartTime;

    // Collect artifacts
    const artifacts = collectArtifacts();
    results.forEach((result, index) => {
      const platform = buildConfigs[index].platform;
      const artifact = artifacts.find(a =>
        (platform === 'windows' && a.name.endsWith('.exe')) ||
        (platform.includes('linux') && a.name.endsWith('.AppImage'))
      );
      if (artifact) { result.artifactName = artifact.name; result.artifactSize = artifact.size; }
    });

    // ===================== RESULTS =====================
    log.section('Build Results');

    let allSuccess = true;

    results.forEach((result, index) => {
      const platform = buildConfigs[index].platform;
      const status = result.success ? '✓ Success' : '✗ Failed';
      const duration = formatDuration(result.duration || 0);
      const size = result.artifactSize ? formatBytes(result.artifactSize) : 'N/A';
      const statusColor = result.success ? neon.green : neon.red;
      console.log(`  ${platform.padEnd(15)} ${statusColor}${status}${neon.reset}  ${duration.padEnd(8)} ${size}`);
      if (!result.success) allSuccess = false;
    });

    console.log();
    console.log(`  Total time: ${formatDuration(buildDuration)}`);

    // Cache statistics
    const finalCacheStats = buildCache.getStats();
    console.log();
    console.log(`  ${neon.dim}Cache Statistics:${neon.reset}`);
    console.log(`    • Total size: ${finalCacheStats.totalSize}`);
    console.log(`    • Hit rate: ${finalCacheStats.hitRate}`);
    console.log(`    • Cached builds: ${finalCacheStats.cacheCount}`);

    // Artifacts
    if (artifacts.length > 0) {
      console.log();
      console.log(`  Generated artifacts:`);
      artifacts.forEach(a => {
        console.log(`    • ${a.name} (${a.sizeFormatted})`);
      });
    }

    // ===================== FINAL =====================
    logStream.write(`\n${'='.repeat(60)}\n`);
    logStream.write(`Build ${allSuccess ? 'SUCCESS' : 'FAILED'}\n`);
    logStream.write(`Total duration: ${formatDuration(buildDuration)}\n`);
    logStream.write(`Artifacts: ${artifacts.length}\n`);
    artifacts.forEach(a => logStream.write(`  - ${a.name} (${a.sizeFormatted})\n`));
    
    // Write build results summary
    logStream.write(`\n--- Build Results ---\n`);
    results.forEach((result, index) => {
      const platform = buildConfigs[index].platform;
      logStream.write(`\n[${platform}]\n`);
      logStream.write(`  Status: ${result.success ? 'SUCCESS' : 'FAILED'}\n`);
      logStream.write(`  Duration: ${formatDuration(result.duration || 0)}\n`);
      if (result.artifactName) logStream.write(`  Artifact: ${result.artifactName}\n`);
      if (result.artifactSize) logStream.write(`  Size: ${formatBytes(result.artifactSize)}\n`);
    });
    logStream.end();

    console.log();

    if (allSuccess) {
      console.log(`${neon.green}✓ All builds successful${neon.reset}`);
      console.log();
      console.log(`  Next steps:`);
      console.log(`    1. Test artifacts in dist/ folder`);
    } else {
      console.log(`${neon.red}✗ Some builds failed${neon.reset}`);
      console.log();
      console.log(`  Troubleshooting:`);
      console.log(`    1. Check build log: ${logFile}`);
      console.log(`    2. WSL issues: wsl --shutdown && wsl`);
      console.log(`    3. Missing deps: sudo apt install libnss3 libgtk-3-0`);
    }

    console.log();
    console.log(`  Total time: ${formatDuration(Date.now() - startTime)}`);
    console.log();

    rl.close();

  } catch (err) {
    log.error(`Fatal error: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    rl.close();
    process.exit(1);
  }
}

// ===================== CLI ARGS =====================
const args = process.argv.slice(2);

if (args.includes('--clear-cache') || args.includes('-c')) {
  buildCache.clear();
  log.success('Build cache cleared');
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log();
  console.log(`${neon.cyan}${neon.bold}Lightning Games Build System${neon.reset}`);
  console.log();
  console.log(`  Usage: node scripts/build.js [options]`);
  console.log();
  console.log(`  Options:`);
  console.log(`    --clear-cache, -c    Clear build cache and exit`);
  console.log(`    --help, -h           Show this help message`);
  console.log(`    --debug              Enable debug logging`);
  console.log();
  process.exit(0);
}

if (args.includes('--debug')) process.env.DEBUG = '1';

main();
