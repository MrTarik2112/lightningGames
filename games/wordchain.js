// Word Chain - Chain words together
class WordChain {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.currentWord = '';
        this.usedWords = [];
        this.timeLeft = 30;
        this.difficulty = 1;
        
        this.commonWords = ['APPLE', 'BEACH', 'CLOUD', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE', 'IMAGE', 'JUICE',
                           'KITE', 'LEMON', 'MOON', 'NIGHT', 'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'STORM', 'TIGER',
                           'UMBRA', 'VOICE', 'WATER', 'XENON', 'YOUTH', 'ZEBRA', 'BREAD', 'CHAIR', 'DREAM', 'EARTH',
                           'FRUIT', 'GHOST', 'HEART', 'INDIA', 'JOKER', 'KNIFE', 'LIGHT', 'MUSIC', 'NURSE', 'OPERA'];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.currentWord = this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
        this.usedWords = [this.currentWord];
        this.timeLeft = 30;
        this.difficulty = 1;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (this.gameOver) {
                if (e.code === 'Space') this.init(this.canvas, this.ctx);
                return;
            }
            
            if (e.key === 'Backspace') {
                this.currentWord = this.currentWord.slice(0, -1);
                return;
            }
            
            if (e.key.length === 1 && e.key.match(/[A-Z]/i)) {
                this.currentWord += e.key.toUpperCase();
                this._checkWord();
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
    }

    _checkWord() {
        if (this.currentWord.length < 3) return;
        
        const valid = this.commonWords.includes(this.currentWord) && 
                     !this.usedWords.includes(this.currentWord) &&
                     this.currentWord[0] === this.usedWords[this.usedWords.length - 1][this.usedWords[this.usedWords.length - 1].length - 1];
        
        if (valid) {
            this.usedWords.push(this.currentWord);
            this.score += this.currentWord.length * 10;
            this.timeLeft += 3;
            this.difficulty += 0.1;
            
            if (window.soundManager) window.soundManager.playScore();
            
            this.currentWord = '';
        }
    }

    _getHint() {
        const lastChar = this.usedWords[this.usedWords.length - 1][this.usedWords[this.usedWords.length - 1].length - 1];
        const candidates = this.commonWords.filter(w => 
            w.startsWith(lastChar) && !this.usedWords.includes(w)
        );
        
        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }
        return 'NONE';
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.timeLeft -= dt;
        
        if (this.timeLeft <= 0) {
            this.gameOver = true;
            this._unbindEvents();
            if (window.soundManager) window.soundManager.playDeath();
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < this.usedWords.length - 1; i++) {
            const x1 = 100 + (i % 6) * 120;
            const y1 = 150 + Math.floor(i / 6) * 60;
            const x2 = 100 + ((i + 1) % 6) * 120;
            const y2 = 150 + Math.floor((i + 1) / 6) * 60;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        for (let i = 0; i < this.usedWords.length; i++) {
            const x = 100 + (i % 6) * 120;
            const y = 150 + Math.floor(i / 6) * 60;
            
            ctx.fillStyle = '#00d4ff';
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.usedWords[i].substring(0, 3), x, y);
        }
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 48px Inter';
            ctx.fillText('TIME UP!', canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.fillText('Score: ' + this.score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Words: ' + this.usedWords.length, canvas.width / 2, canvas.height / 2 + 55);
            ctx.font = '18px Inter';
            ctx.fillStyle = '#888';
            ctx.fillText('Press Space to restart', canvas.width / 2, canvas.height / 2 + 100);
            return;
        }
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height - 100, 300, 50);
        ctx.strokeStyle = this.currentWord.length > 0 ? '#00ff88' : '#444';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 150, canvas.height - 100, 300, 50);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentWord || 'TYPE HERE', canvas.width / 2, canvas.height - 60);
        
        const hint = this._getHint();
        ctx.fillStyle = '#666';
        ctx.font = '14px Inter';
        ctx.fillText('Hint: ' + hint, canvas.width / 2, canvas.height - 130);
        
        ctx.fillStyle = this.timeLeft > 10 ? '#00ff88' : '#ff4466';
        ctx.font = 'bold 24px Inter';
        ctx.fillText('Time: ' + Math.ceil(this.timeLeft) + 's', canvas.width / 2, 45);
        
        ctx.fillStyle = '#fff';
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 75);
        
        ctx.fillStyle = '#555';
        ctx.font = '14px Inter';
        ctx.fillText('Type words starting with last letter | Space to restart', canvas.width / 2, canvas.height - 25);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('wordchain', WordChain, {
        name: 'Word Chain',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
