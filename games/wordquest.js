// Word Quest - Word Puzzle Game
class WordQuestGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;

        this.words = [
            'CAT', 'DOG', 'SUN', 'BAT', 'HAT', 'RAT', 'MAT', 'FAT', 'EAT', 'TEA',
            'RUN', 'FUN', 'WIN', 'BIN', 'PIN', 'TIN', 'FIN', 'SIN', 'JOY', 'TOY',
            'BOY', 'CAR', 'BAR', 'JAR', 'FAR', 'WAR', 'ACE', 'AGE', 'APE', 'ICE',
            'ONE', 'USE', 'GAME', 'PLAY', 'TIME', 'WORD', 'CODE', 'TEST', 'BEST', 'MATH',
            'READ', 'BOOK', 'DESK', 'CHAIR', 'LIGHT', 'WATER', 'FIRE', 'WIND', 'EARTH', 'MOON',
            'STAR', 'TREE', 'FLOWER', 'BIRD', 'FISH', 'LION', 'TIGER', 'BEAR', 'WOLF', 'EAGLE'
        ];

        this.currentWord = '';
        this.scrambled = '';
        this.input = '';
        this.timeLeft = 30;
        this.level = 1;
        this.streak = 0;
        this.feedback = '';
        this.feedbackTimer = 0;
        this.feedbackColor = '#ffffff';
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.level = 1;
        this.streak = 0;
        this.timeLeft = 30;
        this.input = '';
        this.feedback = '';
        this.feedbackTimer = 0;

        this.nextWord();
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;

            if (e.key === 'Enter') {
                this.checkAnswer();
            } else if (e.key === 'Backspace') {
                this.input = this.input.slice(0, -1);
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                if (this.input.length < this.currentWord.length) {
                    this.input += e.key.toUpperCase();
                }
            }
        };

        document.addEventListener('keydown', this._keyHandler);
    }

    shuffleString(str) {
        let arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        let result = arr.join('');
        if (result === str && str.length > 1) return this.shuffleString(str);
        return result;
    }

    nextWord() {
        // Filter words by difficulty
        const minLen = Math.min(3 + Math.floor(this.level / 3), 6);
        const maxLen = Math.min(4 + Math.floor(this.level / 2), 8);
        const available = this.words.filter(w => w.length >= minLen && w.length <= maxLen);
        this.currentWord = available[Math.floor(Math.random() * available.length)];
        this.scrambled = this.shuffleString(this.currentWord);
        this.input = '';
    }

    checkAnswer() {
        if (this.input.toUpperCase() === this.currentWord) {
            this.streak++;
            const timeBonus = Math.floor(this.timeLeft);
            const points = this.currentWord.length * 10 * Math.max(1, this.streak) + timeBonus;
            this.score += points;
            this.feedback = `+${points}`;
            this.feedbackColor = '#44ff44';
            this.feedbackTimer = 1;
            this.timeLeft = Math.max(10, 30 - this.level * 1.5);

            if (this.streak % 3 === 0) {
                this.level++;
                this.feedback = `LEVEL UP! +${points}`;
            }

            if (window.soundManager) { window.soundManager.playDing(); window.soundManager.playScore(); }

            // Achievements
            if (this.score >= 500) {
                window.gameManager.unlockAchievement('word_master', 'Word Master', 'Scored 500 in Word Quest.', '📚', false);
            }

            this.nextWord();
        } else {
            this.streak = 0;
            this.timeLeft = Math.max(5, this.timeLeft - 5);
            this.feedback = 'WRONG!';
            this.feedbackColor = '#ff4444';
            this.feedbackTimer = 0.8;
            this.input = '';
            window.gameManager.shakeScreen(0.3);
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('wordquest', this.score);
        this._removeListeners();
        this._showGameOverOverlay();
    }

    _removeListeners() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager.getHighScore('wordquest');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Time's Up!</div>
            <div class="game-over-score">Level ${this.level} • Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="wordquest-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#wordquest-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        if (this.gameOver) return;

        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this._triggerGameOver();
            return;
        }

        if (this.feedbackTimer > 0) {
            this.feedbackTimer -= dt;
        }
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background gradient
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#0d1b2a');
        bg.addColorStop(1, '#1b263b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background pattern
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 9; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillRect(i * 75, j * 65, 75, 65);
                }
            }
        }

        // Title
        ctx.fillStyle = '#55ffaa';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#55ffaa';
        ctx.shadowBlur = 20;
        ctx.fillText('WORD QUEST', canvas.width/2, 60);
        ctx.shadowBlur = 0;

        // Level info
        ctx.fillStyle = '#8888aa';
        ctx.font = '500 16px Inter, sans-serif';
        ctx.fillText(`LEVEL ${this.level}`, canvas.width/2, 95);

        // Scrambled word
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 56px JetBrains Mono, monospace';
        ctx.fillText(this.scrambled, canvas.width/2, 180);

        // Input box
        const boxWidth = 300;
        const boxHeight = 60;
        const boxX = canvas.width/2 - boxWidth/2;
        const boxY = 220;

        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.stroke();

        // Input text
        ctx.fillStyle = '#00ffff';
        ctx.font = '40px JetBrains Mono, monospace';
        ctx.fillText(this.input || '_', canvas.width/2, boxY + 42);

        // Timer bar
        const timerWidth = (this.timeLeft / 30) * 400;
        const timerColor = this.timeLeft > 10 ? '#44ff44' : '#ff4444';
        ctx.fillStyle = '#333';
        ctx.fillRect(canvas.width/2 - 200, 310, 400, 20);
        ctx.fillStyle = timerColor;
        ctx.fillRect(canvas.width/2 - 200, 310, timerWidth, 20);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(canvas.width/2 - 200, 310, 400, 20);

        // Time text
        ctx.fillStyle = '#ffffff';
        ctx.font = '500 14px Inter, sans-serif';
        ctx.fillText(Math.ceil(this.timeLeft) + 's', canvas.width/2, 345);

        // Stats
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '500 18px Inter, sans-serif';
        ctx.fillText(`Streak: ${this.streak}x`, canvas.width/2 - 150, 380);
        ctx.fillText(`Score: ${this.score}`, canvas.width/2 + 150, 380);

        // Feedback
        if (this.feedback && this.feedbackTimer > 0) {
            ctx.fillStyle = this.feedbackColor;
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.globalAlpha = Math.min(1, this.feedbackTimer);
            ctx.fillText(this.feedback, canvas.width/2, 430);
            ctx.globalAlpha = 1;
        }

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '400 14px Inter, sans-serif';
        ctx.fillText('Type the unscrambled word! ENTER to submit, BACKSPACE to delete', canvas.width/2, canvas.height - 20);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._removeListeners(); }
    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('wordquest', WordQuestGame, {
    name: 'Word Quest',
    canvasWidth: 880,
    canvasHeight: 540
});
