// Game Manager v2.0 - handles game lifecycle, freeze/resume, state, high scores

class GameManager {
    // All games are loaded at startup via script tags in index.html
    
    constructor() {
        this.games = {};
        this.activeGame = null;
        this.animFrameId = null;
        this.isPaused = false;
        this.canvas = null;
        this.ctx = null;
        this.lastTime = 0;
        this.highScores = this._loadHighScores();
        this.totalGamesPlayed = parseInt(localStorage.getItem('lg_totalGames') || '0');
        this.volume = parseFloat(localStorage.getItem('lg_volume') || '0.5');
        if (window.soundManager) window.soundManager.setVolume(this.volume);
        this.lastPlayed = this._loadLastPlayed();
        this.achievements = this._loadAchievements();
        this._lastScore = 0;

        // Experience settings
        this.settings = this._loadSettings();

        // Advanced Trackers
        this.totalPlayTime = parseFloat(localStorage.getItem('lg_totalPlayTime') || '0');
        this.consecutiveGames = parseInt(localStorage.getItem('lg_consecutiveGames') || '0');
        this.lastGameId = localStorage.getItem('lg_lastGameId') || '';
        this.sessionTabSwitches = 0;
        this.uniqueGamesPlayed = JSON.parse(localStorage.getItem('lg_uniqueGames') || '[]');
        this.totalAsteroidsDestroyed = parseInt(localStorage.getItem('lg_totalAsteroids') || '0');
        this.favorites = this._loadFavorites();

        // UI Caching
        this._ui = {
            score: null,
            highscore: null,
            pauseOverlay: null
        };

        // Timer for play time
        this._lastTimeUpdate = Date.now();
        setInterval(() => this._trackPlayTime(), 10000); // Every 10s
    }

    _loadHighScores() {
        try {
            return JSON.parse(localStorage.getItem('lg_highscores') || '{}');
        } catch {
            return {};
        }
    }

    _saveHighScores() {
        localStorage.setItem('lg_highscores', JSON.stringify(this.highScores));
    }

    _loadLastPlayed() {
        try { return JSON.parse(localStorage.getItem('lg_lastPlayed') || '{}'); }
        catch { return {}; }
    }

    _saveLastPlayed() {
        localStorage.setItem('lg_lastPlayed', JSON.stringify(this.lastPlayed));
    }

    _loadAchievements() {
        try { return JSON.parse(localStorage.getItem('lg_achievements') || '[]'); }
        catch { return []; }
    }

    _saveAchievements() {
        localStorage.setItem('lg_achievements', JSON.stringify(this.achievements));
    }

    _loadFavorites() {
        try { return JSON.parse(localStorage.getItem('lg_favorites') || '[]'); }
        catch { return []; }
    }

    _saveFavorites() {
        localStorage.setItem('lg_favorites', JSON.stringify(this.favorites));
    }

    _saveTotalGames() {
        localStorage.setItem('lg_totalGames', this.totalGamesPlayed.toString());
    }

    _loadSettings() {
        try {
            const raw = localStorage.getItem('lg_settings');
            if (!raw) {
                return {
                    reducedMotion: true,
                    shakeIntensity: 0.6,
                    renderScale: 0.9,
                    // New settings with defaults
                    particleDensity: 1.0,
                    glowIntensity: 1.0,
                    animSpeed: 1.0,
                    showFPS: false,
                    screenFlash: true,
                    sfxVolume: 1.0,
                    musicVolume: 0.5,
                    muteOnBlur: true,
                    autoPause: false,
                    confirmExit: false,
                    showTimer: true,
                    difficulty: 'normal',
                    compactMode: false,
                    showDescriptions: true,
                    achievementNotifications: true,
                    cardSize: 1.0
                };
            }
            const parsed = JSON.parse(raw);
            return {
                reducedMotion: !!parsed.reducedMotion,
                shakeIntensity: typeof parsed.shakeIntensity === 'number'
                    ? Math.max(0, Math.min(1, parsed.shakeIntensity))
                    : 0.6,
                renderScale: typeof parsed.renderScale === 'number'
                    ? Math.max(0.7, Math.min(1, parsed.renderScale))
                    : 0.9,
                // New settings
                particleDensity: typeof parsed.particleDensity === 'number' ? Math.max(0, Math.min(1, parsed.particleDensity)) : 1.0,
                glowIntensity: typeof parsed.glowIntensity === 'number' ? Math.max(0, Math.min(1, parsed.glowIntensity)) : 1.0,
                animSpeed: typeof parsed.animSpeed === 'number' ? Math.max(0.5, Math.min(2, parsed.animSpeed)) : 1.0,
                showFPS: !!parsed.showFPS,
                screenFlash: parsed.screenFlash !== false,
                sfxVolume: typeof parsed.sfxVolume === 'number' ? Math.max(0, Math.min(1, parsed.sfxVolume)) : 1.0,
                musicVolume: typeof parsed.musicVolume === 'number' ? Math.max(0, Math.min(1, parsed.musicVolume)) : 0.5,
                muteOnBlur: parsed.muteOnBlur !== false,
                autoPause: !!parsed.autoPause,
                confirmExit: !!parsed.confirmExit,
                showTimer: parsed.showTimer !== false,
                difficulty: parsed.difficulty || 'normal',
                compactMode: !!parsed.compactMode,
                showDescriptions: parsed.showDescriptions !== false,
                achievementNotifications: parsed.achievementNotifications !== false,
                cardSize: typeof parsed.cardSize === 'number' ? Math.max(0.8, Math.min(1.2, parsed.cardSize)) : 1.0
            };
        } catch {
            return {
                reducedMotion: true,
                shakeIntensity: 0.6,
                renderScale: 0.9,
                particleDensity: 1.0,
                glowIntensity: 1.0,
                animSpeed: 1.0,
                showFPS: false,
                screenFlash: true,
                sfxVolume: 1.0,
                musicVolume: 0.5,
                muteOnBlur: true,
                autoPause: false,
                confirmExit: false,
                showTimer: true,
                difficulty: 'normal',
                compactMode: false,
                showDescriptions: true,
                achievementNotifications: true,
                cardSize: 1.0
            };
        }
    }

    _saveSettings() {
        localStorage.setItem('lg_settings', JSON.stringify(this.settings));
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSettings(partial) {
        const next = {
            ...this.settings,
            ...partial
        };
        // Clamp values
        next.reducedMotion = !!next.reducedMotion;
        next.shakeIntensity = Math.max(0, Math.min(1, Number(next.shakeIntensity || 0)));
        if (typeof next.renderScale === 'number') {
            next.renderScale = Math.max(0.7, Math.min(1, Number(next.renderScale)));
        }
        this.settings = next;
        this._saveSettings();
        console.log(`[GameManager] Settings updated:`, this.settings);
        // Inform UI if needed
        const evt = new CustomEvent('settingsChanged', { detail: { settings: this.getSettings() } });
        window.dispatchEvent(evt);
    }

    _trackPlayTime() {
        if (this.activeGame) {
            const now = Date.now();
            const diff = (now - this._lastTimeUpdate) / 1000;
            this.totalPlayTime += diff;
            this._lastTimeUpdate = now;
            localStorage.setItem('lg_totalPlayTime', this.totalPlayTime.toString());

            if (this.totalPlayTime >= 3600) {
                this.unlockAchievement('addict', 'Addict', 'Total playtime exceeded 1 hour.', '💊', true);
            }
        } else {
            this._lastTimeUpdate = Date.now();
        }
    }

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        localStorage.setItem('lg_volume', this.volume.toString());
        if (window.soundManager) window.soundManager.setVolume(this.volume);
    }

    toggleFavorite(gameId) {
        const index = this.favorites.indexOf(gameId);
        if (index === -1) {
            this.favorites.push(gameId);
        } else {
            this.favorites.splice(index, 1);
        }
        this._saveFavorites();
        return this.isFavorite(gameId);
    }

    isFavorite(gameId) {
        return this.favorites.includes(gameId);
    }


    getHighScore(gameId) {
        return this.highScores[gameId] || 0;
    }

    checkAndUpdateHighScore(gameId, score) {
        const prev = this.highScores[gameId] || 0;
        if (score > prev) {
            this.highScores[gameId] = score;
            this._saveHighScores();
            return true; // new high score!
        }
        return false;
    }

    registerGame(id, gameClass, meta) {
        this.games[id] = {
            id,
            meta,
            GameClass: gameClass,
            instance: null,
            hasState: false,
            loaded: !!gameClass
        };
    }

    async _lazyLoadGame(id) {
        const game = this.games[id];
        if (!game) {
            console.error(`[GameManager] No game entry in registry for: ${id}`);
            return false;
        }
        
        if (game.loaded && game.GameClass) {
            console.log(`[GameManager] Game already loaded: ${id}`);
            return true;
        }
        
        if (this._loadingGames[id]) {
            console.log(`[GameManager] Game already loading: ${id}`);
            return this._loadingGames[id];
        }
        
        console.log(`[GameManager] Starting lazy load for: ${id}`);
        const promise = this._doLazyLoad(id);
        this._loadingGames[id] = promise;
        
        try {
            await promise;
            return true;
        } catch (e) {
            console.error(`[GameManager] Failed to load game ${id}:`, e);
            this._loadingGames[id] = null;
            return false;
        }
    }

    async _doLazyLoad(id) {
        const scriptPath = this._gameManifest[id];
        if (!scriptPath) {
            throw new Error(`No manifest entry for game: ${id}`);
        }
        
        console.log(`[GameManager] Loading script: ${scriptPath}`);
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => {
                console.log(`[GameManager] Script loaded: ${scriptPath}`);
                
                // Wait for the script to execute and registerGame to run
                let attempts = 0;
                const maxAttempts = 20;
                
                const checkRegistered = () => {
                    attempts++;
                    const gameEntry = this.games[id];
                    console.log(`[GameManager] Check ${attempts}: gameEntry =`, gameEntry);
                    
                    // If game was already registered (has GameClass), we're good
                    if (gameEntry && gameEntry.GameClass) {
                        gameEntry.loaded = true;
                        console.log(`[GameManager] Game registered successfully: ${id}`);
                        resolve();
                        return;
                    }
                    
                    // If we have attempts left, keep checking
                    if (attempts < maxAttempts) {
                        setTimeout(checkRegistered, 50);
                        return;
                    }
                    
                    // Give up after timeout
                    console.error(`[GameManager] Timeout waiting for game registration: ${id}`);
                    console.error(`[GameManager] Game entry:`, gameEntry);
                    reject(new Error(`Game registration timeout: ${id}`));
                };
                
                // Start checking after a short delay
                setTimeout(checkRegistered, 100);
            };
            script.onerror = (e) => {
                console.error(`[GameManager] Script failed to load: ${scriptPath}`, e);
                reject(e);
            };
            document.head.appendChild(script);
        });
    }

    getCanvas() {
        if (!this.canvas) {
            this.canvas = document.getElementById('game-canvas');
            // Extreme Canvas Hardware Optimization
            this.ctx = this.canvas.getContext('2d', {
                alpha: false, // Disables transparency blending (faster)
                desynchronized: true, // Bypasses DOM compositor (lower latency)
                willReadFrequently: false // Optimizes for write-heavy rendering
            });
        }
        return { canvas: this.canvas, ctx: this.ctx };
    }

    startGame(id) {
        console.log('[GameManager] startGame called:', id);
        const game = this.games[id];
        if (!game) {
            console.error(`[GameManager] Game not found: ${id}`);
            return;
        }
        
        if (!game.GameClass) {
            console.error(`[GameManager] Game class not registered: ${id}`);
            return;
        }

        console.log('[GameManager] Game class found:', game.GameClass.name);
        
        this.stopLoop();

        const { canvas, ctx } = this.getCanvas();
        console.log('[GameManager] Canvas:', canvas.width, 'x', canvas.height);

        const baseWidth = game.meta.canvasWidth || 880;
        const baseHeight = game.meta.canvasHeight || 540;
        const scale = (this.settings && typeof this.settings.renderScale === 'number')
            ? this.settings.renderScale
            : 1;

        canvas.width = Math.round(baseWidth * scale);
        canvas.height = Math.round(baseHeight * scale);

        this.activeGame = game;
        this.isPaused = false;
        this._lastScore = 0;

        // Update high-score display
        this._updateHighScoreDisplay(id);

        // Hide pause overlay
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');

        // Check if previous game instance was game over - if so, create new instance
        const wasGameOver = game.instance && game.instance.isGameOver && game.instance.isGameOver();

        if (!game.instance || wasGameOver) {
            // Clean up old instance if it exists
            if (game.instance && game.instance.destroy) {
                game.instance.destroy();
            }
            game.instance = new game.GameClass();
            
            // Reload settings to ensure we have the latest difficulty
            this.settings = this._loadSettings();
            
            // Apply difficulty setting BEFORE init if game supports it (Tower Defense)
            if (game.instance.setDifficulty && this.settings && this.settings.difficulty) {
                console.log(`[GameManager] Applying difficulty: ${this.settings.difficulty}`, this.settings);
                game.instance.setDifficulty(this.settings.difficulty);
            } else {
                console.log(`[GameManager] No difficulty applied. setDifficulty: ${!!game.instance.setDifficulty}, settings: ${!!this.settings}, difficulty: ${this.settings?.difficulty}`);
            }
            
            game.instance.init(canvas, ctx);
            
            game.hasState = true;
            this.totalGamesPlayed++;
            this._saveTotalGames();
        } else if (game.hasState) {
            game.instance.resume();
        } else {
            game.instance.init(canvas, ctx);
            
            // Apply difficulty setting if game supports it (Tower Defense)
            if (game.instance.setDifficulty && this.settings && this.settings.difficulty) {
                game.instance.setDifficulty(this.settings.difficulty);
            }
            
            game.hasState = true;
            this.totalGamesPlayed++;
            this._saveTotalGames();
        }

        // Update last played
        this.lastPlayed[id] = Date.now();
        this._saveLastPlayed();

        // Check for "First Game" achievement
        this.unlockAchievement('first_game', 'Welcome!', 'You launched your first game.', '🎮');

        // Advanced Achievement Checks
        this._checkTimedAchievements();
        this._checkExplorer(id);
        this._checkConsecutive(id);
        this._checkTotalPlayed();

        game.hasState = true;
        this.lastTime = performance.now();
        console.log('[GameManager] Calling startLoop...');
        this.startLoop();
        console.log('[GameManager] startLoop returned, activeGame:', this.activeGame ? this.activeGame.id : 'none');

        // Start game music
        if (window.soundManager) window.soundManager.startMusic(id);
        
        console.log('[GameManager] startGame complete');
    }

    _updateHighScoreDisplay(gameId) {
        const el = document.getElementById('game-highscore');
        if (el) {
            const hs = this.getHighScore(gameId);
            el.textContent = hs > 0 ? hs : '--';
        }
    }

    startLoop() {
        const loop = (timestamp) => {
            if (this.isPaused || !this.activeGame) return;

            // Frame independent movement with cap for lag spikes
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
            this.lastTime = timestamp;

            if (this.activeGame.instance) {
                this.activeGame.instance.update(dt);
                this.activeGame.instance.draw();

                // UI updates - only when score changes
                const score = this.activeGame.instance.getScore();
                if (score !== this._lastScore) {
                    this._updateScoreUI(score);
                    this._lastScore = score;
                }
            }

            this.animFrameId = requestAnimationFrame(loop);
        };

        this.stopLoop();
        this.lastTime = performance.now();
        this.animFrameId = requestAnimationFrame(loop);
    }

    _updateScoreUI(score) {
        if (!this._ui.score) this._ui.score = document.getElementById('game-score');
        if (!this._ui.highscore) this._ui.highscore = document.getElementById('game-highscore');

        if (this._ui.score) {
            this._ui.score.textContent = score;
            this._ui.score.classList.remove('score-pop');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (this._ui.score) this._ui.score.classList.add('score-pop');
                });
            });
        }

        const currentHS = this.getHighScore(this.activeGame.id);
        if (score > currentHS && this._ui.highscore) {
            this._ui.highscore.textContent = score;
            this._ui.highscore.classList.remove('new-highscore');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (this._ui.highscore) this._ui.highscore.classList.add('new-highscore');
                });
            });

            // Achievement: High Score breaker
            if (currentHS > 0) {
                this.unlockAchievement('record_breaker', 'Record Breaker!', `${this.activeGame.meta.name} record broken!`, '🏆');
            }
        }

        // Progress achievements
        if (score >= 1000) {
            this.unlockAchievement('score_1000', 'Master Player', 'Reached 1000 points in any game.', '🔥');
        }
    }

    unlockAchievement(id, title, desc, icon, ultra = false) {
        if (this.achievements.includes(id)) return;

        this.achievements.push(id);
        this._saveAchievements();

        if (window.soundManager) window.soundManager.playAchievement();
        if (window.bgPulse) window.bgPulse(null, null, [255, 204, 0]);

        // Trigger UI event
        const event = new CustomEvent('achievementUnlocked', { detail: { title, desc, icon, ultra } });
        window.dispatchEvent(event);

        // Meta achievements
        if (this.achievements.length >= 15) {
            this.unlockAchievement('collector', 'Collector', 'Unlocked 15 achievements.', '👑', true);
        }

        const total = this.totalAchievementsCount || 35;
        if (this.achievements.length >= total - 1) {
            this.unlockAchievement('godly', 'Godly', 'Unlocked all achievements.', '⛩️', true);
        }
    }

    _checkTimedAchievements() {
        const hour = new Date().getHours();
        const day = new Date().getDay();

        if (hour >= 22 || hour < 4) {
            this.unlockAchievement('night_owl', 'Night Owl', 'Played a game after 10 PM.', '🦉', true);
        }
        if (hour >= 5 && hour < 8) {
            this.unlockAchievement('early_bird', 'Early Bird', 'Played a game before 8 AM.', '🐤', true);
        }
        if (day === 0 || day === 6) {
            this.unlockAchievement('weekend_warrior', 'Weekend Warrior', 'Played a game on Saturday or Sunday.', '⚔️', true);
        }
    }

    _checkExplorer(gameId) {
        if (!this.uniqueGamesPlayed.includes(gameId)) {
            this.uniqueGamesPlayed.push(gameId);
            localStorage.setItem('lg_uniqueGames', JSON.stringify(this.uniqueGamesPlayed));
        }
        if (this.uniqueGamesPlayed.length >= 10) {
            this.unlockAchievement('explorer', 'Explorer', 'Played 10 different games.', '🗺️', true);
        }
    }

    _checkConsecutive(gameId) {
        if (this.lastGameId === gameId) {
            this.consecutiveGames++;
        } else {
            this.consecutiveGames = 1;
            this.lastGameId = gameId;
        }
        localStorage.setItem('lg_consecutiveGames', this.consecutiveGames.toString());
        localStorage.setItem('lg_lastGameId', this.lastGameId);

        if (this.consecutiveGames >= 5) {
            this.unlockAchievement('persistent', 'Persistent', 'Played the same game 5 times in a row.', '🔄', true);
        }
    }

    _checkTotalPlayed() {
        if (this.totalGamesPlayed >= 10) {
            this.unlockAchievement('warmup', 'Warmup Done', 'Played a total of 10 games.', '🔥');
        }
        if (this.totalGamesPlayed >= 25) {
            this.unlockAchievement('getting_started', 'Getting Started', 'Played a total of 25 games.', '🎮');
        }
        if (this.totalGamesPlayed >= 50) {
            this.unlockAchievement('marathon_runner', 'Marathon Runner', 'Played a total of 50 games.', '🏃', true);
        }
        if (this.totalGamesPlayed >= 75) {
            this.unlockAchievement('dedicated', 'Dedicated', 'Played a total of 75 games.', '💪', true);
        }
        if (this.totalGamesPlayed >= 100) {
            this.unlockAchievement('no_life', 'Non-Stop', 'Played a total of 100 games.', '⚡', true);
        }
        if (this.totalGamesPlayed >= 250) {
            this.unlockAchievement('obsessed', 'Obsessed', 'Played a total of 250 games.', '🔥', true);
        }
        if (this.totalGamesPlayed >= 500) {
            this.unlockAchievement('legend', 'Legend', 'Played a total of 500 games.', '👑', true);
        }
        if (this.totalGamesPlayed >= 1000) {
            this.unlockAchievement('immortal', 'Immortal', 'Played a total of 1000 games.', '⛩️', true);
        }
    }

    _checkGameSpecificAchievements(gameId, score) {
        // Snake achievements
        if (gameId === 'snake') {
            if (score >= 100) this.unlockAchievement('snake_100', 'Snake Tamer', 'Scored 100 points in Snake.', '🐍');
            if (score >= 250) this.unlockAchievement('snake_charmer', 'Snake Charmer', 'Scored 250 points in Snake.', '🐍', true);
            if (score >= 500) this.unlockAchievement('snake_master', 'Snake Master', 'Scored 500 points in Snake.', '🐍', true);
            if (score >= 1000) this.unlockAchievement('snake_god', 'Snake God', 'Scored 1000 points in Snake.', '🐍', true);
        }
        
        // Tetris achievements
        if (gameId === 'tetris') {
            if (score >= 500) this.unlockAchievement('tetris_500', 'Architect', 'Scored 500 points in Tetris.', '🧱');
            if (score >= 1000) this.unlockAchievement('pentominium', 'Pentominium', 'Scored 1000 points in Tetris.', '🧱', true);
            if (score >= 2500) this.unlockAchievement('tetris_master', 'Tetris Master', 'Scored 2500 points in Tetris.', '🧱', true);
            if (score >= 5000) this.unlockAchievement('tetris_god', 'Block God', 'Scored 5000 points in Tetris.', '🧱', true);
        }
        
        // Memory/Simon achievements
        if (gameId === 'simon') {
            if (score >= 10) this.unlockAchievement('simon_10', 'Memory Apprentice', 'Scored 10 points in Memotron.', '🧠');
            if (score >= 20) this.unlockAchievement('simons_rival', 'Simon\'s Rival', 'Scored 20 points in Memotron.', '🧠', true);
            if (score >= 30) this.unlockAchievement('memory_master', 'Memory Master', 'Scored 30 points in Memotron.', '🧠', true);
        }
        
        // Minesweeper achievements
        if (gameId === 'minesweeper' && score > 0) {
            this.unlockAchievement('minesweeper_win', 'Mine Expert', 'Cleared a challenging minefield.', '💣');
        }
        
        // Runner achievements
        if (gameId === 'runner') {
            if (score >= 500) this.unlockAchievement('runner_high', 'Fast Runner', 'Scored 500 in Neon Runner.', '🦖');
            if (score >= 2000) this.unlockAchievement('marathon_runner_game', 'Marathon Runner', 'Scored 2000 in Neon Runner.', '🦖', true);
            if (score >= 5000) this.unlockAchievement('ultra_runner', 'Ultra Runner', 'Scored 5000 in Neon Runner.', '🦖', true);
        }
        
        // Frogger achievements
        if (gameId === 'frogger') {
            if (score > 0) this.unlockAchievement('frogger_master', 'Frogger Master', 'Crossed the road in Frogger!', '👑');
            if (score >= 1000) this.unlockAchievement('frogger_pro', 'Frogger Pro', 'Score 1000 in Frogger.', '🐸', true);
        }
        
        // 2048 achievements
        if (gameId === 'game2048') {
            if (score >= 4096) this.unlockAchievement('master_2048', '2048 Master', 'Reached the 4096 tile.', '🌟', true);
            if (score >= 8192) this.unlockAchievement('2048_god', '2048 God', 'Reached the 8192 tile.', '✨', true);
        }
        
        // Doodle Jump achievements
        if (gameId === 'doodlejump') {
            if (score >= 10000) this.unlockAchievement('high_jumper', 'High Jumper', 'Reached 10000 height in Neon Jump.', '🚀', true);
            if (score >= 25000) this.unlockAchievement('sky_master', 'Sky Master', 'Reached 25000 height in Neon Jump.', '🚀', true);
        }
        
        // Whack-a-mole achievements
        if (gameId === 'whackamole') {
            if (score >= 200) this.unlockAchievement('mole_slayer', 'Mole Slayer', 'Scored 200 points in Whack-A-Mole.', '🔨', true);
            if (score >= 500) this.unlockAchievement('mole_destroyer', 'Mole Destroyer', 'Scored 500 points in Whack-A-Mole.', '🔨', true);
        }
        
        // Breakout achievements
        if (gameId === 'breakout') {
            if (score >= 1000) this.unlockAchievement('breakout_master', 'Breakout Master', 'Score 1000 in Breakout.', '🧱', true);
        }
        
        // Space Shooter achievements
        if (gameId === 'space') {
            if (score >= 5000) this.unlockAchievement('space_legend', 'Space Legend', 'Score 5000 in Space Shooter.', '🚀', true);
        }
        
        // General score achievements
        if (score >= 5000) {
            this.unlockAchievement('score_5000', 'Elite Player', 'You reached 5000 points in any game.', '💫');
        }
        if (score >= 10000) {
            this.unlockAchievement('score_10000', 'Legendary Player', 'You reached 10000 points in any game.', '👑', true);
        }
        
        // Special score achievements
        if (score === 777) {
            this.unlockAchievement('lucky_seven', 'Lucky Seven', 'Score exactly 777 points in any game.', '🎰', true);
        }
        if (score === 1000) {
            this.unlockAchievement('perfect_score', 'Perfect Score', 'Score exactly 1000 points in any game.', '💯', true);
        }
    }

    _checkPlaytimeAchievements() {
        const minutes = this.totalPlayTime / 60;
        if (minutes >= 10) {
            this.unlockAchievement('quick_break', 'Quick Break', 'Total playtime exceeded 10 minutes.', '⏱️');
        }
        if (minutes >= 30) {
            this.unlockAchievement('casual_gamer', 'Casual Gamer', 'Total playtime exceeded 30 minutes.', '🎮');
        }
        if (minutes >= 60) {
            this.unlockAchievement('addict', 'Addict', 'Total playtime exceeded 1 hour.', '💊', true);
        }
        if (minutes >= 180) {
            this.unlockAchievement('hardcore', 'Hardcore', 'Total playtime exceeded 3 hours.', '🔥', true);
        }
        if (minutes >= 600) {
            this.unlockAchievement('no_sleep', 'No Sleep', 'Total playtime exceeded 10 hours.', '😴', true);
        }
        if (minutes >= 1440) {
            this.unlockAchievement('time_traveler', 'Time Traveler', 'Total playtime exceeded 24 hours.', '⏰', true);
        }
    }

    _checkCollectionAchievements() {
        const count = this.achievements.length;
        if (count >= 15) {
            this.unlockAchievement('collector', 'Collector', 'Unlocked 15 achievements.', '👑', true);
        }
        if (count >= 30) {
            this.unlockAchievement('achievement_hunter', 'Achievement Hunter', 'Unlocked 30 achievements.', '🏹', true);
        }
        if (count >= 50) {
            this.unlockAchievement('completionist_achievements', 'Achievement Master', 'Unlocked 50 achievements.', '🎖️', true);
        }
    }

    _checkConsecutiveAchievements() {
        if (this.consecutiveGames >= 5) {
            this.unlockAchievement('persistent', 'Persistent', 'Played the same game 5 times in a row.', '🔄', true);
        }
        if (this.consecutiveGames >= 10) {
            this.unlockAchievement('super_persistent', 'Super Persistent', 'Played the same game 10 times in a row.', '🔄', true);
        }
    }

    _checkExplorerAchievements() {
        const uniqueCount = this.uniqueGamesPlayed.length;
        if (uniqueCount >= 10) {
            this.unlockAchievement('explorer', 'Explorer', 'Played 10 different games.', '🗺️', true);
        }
        if (uniqueCount >= 40) {
            this.unlockAchievement('completionist', 'Completionist', 'Played all 40 games at least once.', '🎯', true);
        }
    }

    // Call this when a game ends
    checkAllAchievements(gameId, score) {
        this._checkGameSpecificAchievements(gameId, score);
        this._checkPlaytimeAchievements();
        this._checkCollectionAchievements();
        this._checkConsecutiveAchievements();
        this._checkExplorerAchievements();
        this._checkTotalPlayed();
        this._checkTimedAchievements();
    }

    trackAsteroidDestroyed() {
        this.totalAsteroidsDestroyed++;
        localStorage.setItem('lg_totalAsteroids', this.totalAsteroidsDestroyed.toString());
        if (this.totalAsteroidsDestroyed === 1) {
            this.unlockAchievement('first_rock', 'First Rock', 'Destroyed an asteroid for the first time.', '🪨');
        }
        if (this.totalAsteroidsDestroyed >= 50) {
            this.unlockAchievement('asteroid_annihilator', 'Asteroid Annihilator', 'Destroyed a total of 50 asteroids.', '☄️', true);
        }
        if (this.totalAsteroidsDestroyed >= 100) {
            this.unlockAchievement('space_ace', 'Space Ace', 'Destroyed a total of 100 asteroids.', '🌌', true);
        }
    }

    trackTabSwitch() {
        this.sessionTabSwitches++;
        if (this.sessionTabSwitches >= 10) {
            this.unlockAchievement('socialite', 'Socialite', 'Switched tabs 10 times.', '📱', true);
        }
    }

    stopLoop() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    pauseCurrentGame() {
        if (!this.activeGame || !this.activeGame.instance) return;
        this.isPaused = true;
        this.stopLoop();
        if (this.activeGame.instance.pause) {
            this.activeGame.instance.pause();
        }

        // Save high score on pause
        if (this.activeGame.instance.getScore) {
            this.checkAndUpdateHighScore(
                this.activeGame.id,
                this.activeGame.instance.getScore()
            );
        }

        // Show pause overlay (only if game not over)
        if (!this.activeGame.instance.isGameOver || !this.activeGame.instance.isGameOver()) {
            const pauseOverlay = document.getElementById('pause-overlay');
            if (pauseOverlay) pauseOverlay.classList.remove('hidden');
        }

        // Stop music on pause
        if (window.soundManager) window.soundManager.stopMusic();
    }

    resumeCurrentGame() {
        if (!this.activeGame || !this.activeGame.instance) return;
        if (this.activeGame.instance.isGameOver && this.activeGame.instance.isGameOver()) return;
        this.isPaused = false;
        if (this.activeGame.instance.resume) {
            this.activeGame.instance.resume();
        }

        // Hide pause overlay
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');

        this.lastTime = performance.now();
        this.startLoop();

        // Resume music
        if (window.soundManager && this.activeGame) window.soundManager.startMusic(this.activeGame.id);
    }

    resetCurrentGame() {
        if (!this.activeGame) return;
        this.stopLoop();
        const { canvas, ctx } = this.getCanvas();

        // Save score before reset
        if (this.activeGame.instance && this.activeGame.instance.getScore) {
            this.checkAndUpdateHighScore(
                this.activeGame.id,
                this.activeGame.instance.getScore()
            );
        }

        this.activeGame.instance = new this.activeGame.GameClass();
        this.activeGame.instance.init(canvas, ctx);
        this.activeGame.hasState = true;
        this.isPaused = false;
        this._lastScore = 0;
        this.totalGamesPlayed++;
        this._saveTotalGames();
        this.lastTime = performance.now();
        this.startLoop();

        // Update displays
        this._updateHighScoreDisplay(this.activeGame.id);
        const scoreEl = document.getElementById('game-score');
        if (scoreEl) scoreEl.textContent = '0';

        // Remove overlays
        const overlay = document.querySelector('.game-over-overlay');
        if (overlay) overlay.remove();
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');
    }

    _showGameOverOverlay(gameId, score) {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;

        let hs = 0;
        if (window.gameManager) hs = window.gameManager.getHighScore(gameId);
        const isNew = score >= hs && score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Score: ${score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="${gameId}-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector(`#${gameId}-restart`).addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    onGameOver(score) {
        if (!this.activeGame) return;
        this.checkAndUpdateHighScore(this.activeGame.id, score);
        this.checkAllAchievements(this.activeGame.id, score);
        this._showGameOverOverlay(this.activeGame.id, score);
    }

    goBackToLauncher() {
        // Save high score before leaving
        if (this.activeGame && this.activeGame.instance && this.activeGame.instance.getScore) {
            this.checkAndUpdateHighScore(
                this.activeGame.id,
                this.activeGame.instance.getScore()
            );
        }

        // Stop the game loop first
        this.stopLoop();
        this.isPaused = false;

        // Clean up the current game instance if game is over
        if (this.activeGame && this.activeGame.instance) {
            if (this.activeGame.instance.isGameOver && this.activeGame.instance.isGameOver()) {
                // Game is over, destroy the instance and clear state
                if (this.activeGame.instance.destroy) {
                    this.activeGame.instance.destroy();
                }
                this.activeGame.instance = null;
                this.activeGame.hasState = false;
            } else {
                // Game is not over, just pause it
                if (this.activeGame.instance.pause) {
                    this.activeGame.instance.pause();
                }
            }
        }

        // Hide pause overlay when going to launcher
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');

        this.activeGame = null;

        // Stop music when going back
        if (window.soundManager) window.soundManager.stopMusic();
    }

    getActiveGameId() {
        return this.activeGame ? this.activeGame.id : null;
    }

    getGameList() {
        return Object.values(this.games).map(g => ({
            id: g.id,
            ...g.meta,
            hasState: g.hasState,
            score: g.instance ? g.instance.getScore() : 0,
            highScore: this.highScores[g.id] || 0,
            lastPlayed: this.lastPlayed[g.id] || 0,
            isFavorite: this.isFavorite(g.id)
        }));
    }

    getTotalGamesPlayed() {
        return this.totalGamesPlayed;
    }

    // Screen shake effect
    shakeScreen(intensity = 1) {
        const settings = this.settings || this._loadSettings();
        if (settings.reducedMotion || intensity <= 0) {
            return;
        }
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;

        const effectiveIntensity = Math.max(0, Math.min(1, intensity * (settings.shakeIntensity || 1)));
        if (effectiveIntensity <= 0) {
            return;
        }

        // Don't stack animations if already shaking intensely
        if (container.classList.contains('screen-shake') && parseFloat(container.style.getPropertyValue('--shake-intensity') || '0') > intensity) {
            return;
        }

        container.style.setProperty('--shake-intensity', effectiveIntensity);
        container.classList.remove('screen-shake');
        void container.offsetWidth;
        container.classList.add('screen-shake');

        if (this._shakeTimeout) clearTimeout(this._shakeTimeout);
        this._shakeTimeout = setTimeout(() => container.classList.remove('screen-shake'), 300);
    }
}

// Global instance
window.gameManager = new GameManager();
