// Game Manager v2.0 - handles game lifecycle, freeze/resume, state, high scores

class GameManager {
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
                    renderScale: 0.9
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
                    : 0.9
            };
        } catch {
            return {
                reducedMotion: true,
                shakeIntensity: 0.6,
                renderScale: 0.9
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
            hasState: false
        };
    }

    getCanvas() {
        if (!this.canvas) {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
        }
        return { canvas: this.canvas, ctx: this.ctx };
    }

    startGame(id) {
        const game = this.games[id];
        if (!game) return;

        this.stopLoop();

        const { canvas, ctx } = this.getCanvas();

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

        if (!game.instance) {
            game.instance = new game.GameClass();
            game.instance.init(canvas, ctx);
            this.totalGamesPlayed++;
            this._saveTotalGames();
        } else if (game.hasState) {
            game.instance.resume();
        } else {
            game.instance.init(canvas, ctx);
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
        this.startLoop();

        // Start game music
        if (window.soundManager) window.soundManager.startMusic(id);
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
            void this._ui.score.offsetWidth;
            this._ui.score.classList.add('score-pop');
        }

        const currentHS = this.getHighScore(this.activeGame.id);
        if (score > currentHS && this._ui.highscore) {
            this._ui.highscore.textContent = score;
            this._ui.highscore.classList.remove('new-highscore');
            void this._ui.highscore.offsetWidth;
            this._ui.highscore.classList.add('new-highscore');

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
        if (this.totalGamesPlayed >= 50) {
            this.unlockAchievement('marathon_runner', 'Marathon Runner', 'Played a total of 50 games.', '🏃', true);
        }
        if (this.totalGamesPlayed >= 100) {
            this.unlockAchievement('no_life', 'Non-Stop', 'Played a total of 100 games.', '⚡', true);
        }
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
        this.pauseCurrentGame();

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
