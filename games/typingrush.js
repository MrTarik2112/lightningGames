// Typing Rush - Type the words before they fall
class TypingRush {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.words = ['RUN', 'JUMP', 'FAST', 'WIN', 'GAME', 'PLAY', 'CODE', 'NEON', 'COOL', 'COIN', 'STAR', 'TIME', 'SPEED', 'POWER', 'BOOST', 'FLASH', 'QUICK', 'SMART', 'HARD', 'LUCK'];
        this.activeWords = [];
        this.currentInput = '';
        
        this.spawnTimer = 0;
        this.difficulty = 1;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.activeWords = [];
        this.currentInput = '';
        this.spawnTimer = 0;
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
                this.currentInput = this.currentInput.slice(0, -1);
                return;
            }
            
            if (e.key.length === 1 && e.key.match(/[A-Z]/i)) {
                this.currentInput += e.key.toUpperCase();
                
                for (let i = 0; i < this.activeWords.length; i++) {
                    const word = this.activeWords[i];
                    if (word.text === this.currentInput) {
                        this.score += word.text.length * 10;
                        this.activeWords.splice(i, 1);
                        this.currentInput = '';
                        if (window.soundManager) window.soundManager.playScore();
                        return;
                    }
                    
                    if (word.text.startsWith(this.currentInput)) {
                        return;
                    }
                }
                
                this.currentInput = '';
                if (window.soundManager) window.soundManager.playHit();
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.spawnTimer += dt;
        const spawnRate = Math.max(1.5, 2.5 - this.difficulty * 0.2);
        
        if (this.spawnTimer >= spawnRate) {
            this.spawnTimer = 0;
            const word = this.words[Math.floor(Math.random() * this.words.length)];
            this.activeWords.push({
                text: word,
                x: 50 + Math.random() * (this.canvas.width - 150),
                y: -30,
                speed: 40 + this.difficulty * 5
            });
            this.difficulty += 0.05;
        }
        
        for (let i = this.activeWords.length - 1; i >= 0; i--) {
            const word = this.activeWords[i];
            word.y += word.speed * dt;
            
            if (word.y > this.canvas.height - 50) {
                this.gameOver = true;
                this._unbindEvents();
                if (window.soundManager) window.soundManager.playDeath();
            }
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 60) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 60) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        
        for (const word of this.activeWords) {
            const isMatch = word.text.startsWith(this.currentInput) && this.currentInput.length > 0;
            
            ctx.font = 'bold 24px JetBrains Mono';
            
            const matchLen = this.currentInput.length;
            const matchWidth = ctx.measureText(this.currentInput).width;
            
            ctx.fillStyle = isMatch ? '#00ff88' : '#ff4466';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 15;
            
            if (isMatch) {
                ctx.fillText(this.currentInput, word.x, word.y);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(word.text.substring(matchLen), word.x + matchWidth, word.y);
            } else {
                ctx.fillText(word.text, word.x, word.y);
            }
        }
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height - 80, 300, 50);
        ctx.strokeStyle = this.currentInput ? '#00ff88' : '#444';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 150, canvas.height - 80, 300, 50);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentInput || 'TYPE HERE', canvas.width / 2, canvas.height - 45);
        
        ctx.font = 'bold 24px Inter';
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 45);
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 48px Inter';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.fillText('Score: ' + this.score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.font = '18px Inter';
            ctx.fillStyle = '#888';
            ctx.fillText('Press Space to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Type the falling words!', canvas.width / 2, canvas.height - 110);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('typingrush', TypingRush, {
        name: 'Typing Rush',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
