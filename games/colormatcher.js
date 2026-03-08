// Color Matcher - Match colors quickly
class ColorMatcher {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.targetColor = '';
        this.options = [];
        this.timeLeft = 0;
        this.round = 0;
        
        this.colors = [
            { name: 'RED', hex: '#ff4466' },
            { name: 'BLUE', hex: '#00d4ff' },
            { name: 'GREEN', hex: '#00ff88' },
            { name: 'YELLOW', hex: '#ffcc00' },
            { name: 'PURPLE', hex: '#8855ff' },
            { name: 'ORANGE', hex: '#ff8844' },
            { name: 'PINK', hex: '#ff00aa' },
            { name: 'WHITE', hex: '#ffffff' }
        ];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.round = 0;
        
        this._nextRound();
        this._bindEvents();
    }

    _nextRound() {
        this.round++;
        this.timeLeft = Math.max(3, 6 - this.round * 0.1);
        
        const numOptions = Math.min(4 + Math.floor(this.round / 5), 8);
        
        this.options = [];
        const shuffled = [...this.colors].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < numOptions; i++) {
            this.options.push({
                color: shuffled[i],
                x: 0, y: 0, width: 100, height: 100
            });
        }
        
        this.targetColor = this.options[Math.floor(Math.random() * this.options.length)].color;
        
        const cols = 4;
        const spacing = 20;
        const boxWidth = (this.canvas.width - spacing * 2 - spacing * (cols - 1)) / cols;
        
        this.options.forEach((opt, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            opt.width = boxWidth;
            opt.height = 120;
            opt.x = spacing + col * (boxWidth + spacing);
            opt.y = 200 + row * (opt.height + spacing);
        });
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            
            for (const opt of this.options) {
                if (mx >= opt.x && mx <= opt.x + opt.width &&
                    my >= opt.y && my <= opt.y + opt.height) {
                    
                    if (opt.color.name === this.targetColor.name) {
                        this.score += Math.ceil(this.timeLeft) * 10;
                        if (window.soundManager) window.soundManager.playScore();
                        this._nextRound();
                    } else {
                        this.score = Math.max(0, this.score - 10);
                        if (window.soundManager) window.soundManager.playHit();
                    }
                }
            }
        };
        
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('click', this._handlers.click);
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
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('FIND', canvas.width / 2, 60);
        
        ctx.font = 'bold 48px Inter';
        ctx.fillStyle = this.targetColor.hex;
        ctx.shadowColor = this.targetColor.hex;
        ctx.shadowBlur = 30;
        ctx.fillText(this.targetColor.name, canvas.width / 2, 110);
        ctx.shadowBlur = 0;
        
        for (const opt of this.options) {
            const gradient = ctx.createLinearGradient(opt.x, opt.y, opt.x, opt.y + opt.height);
            gradient.addColorStop(0, opt.color.hex);
            gradient.addColorStop(1, opt.color.hex + '88');
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = opt.color.hex;
            ctx.shadowBlur = 20;
            
            ctx.beginPath();
            ctx.roundRect(opt.x, opt.y, opt.width, opt.height, 12);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        const timePercent = this.timeLeft / 6;
        ctx.fillStyle = '#222';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height - 60, 300, 20);
        ctx.fillStyle = timePercent > 0.5 ? '#00ff88' : timePercent > 0.25 ? '#ffcc00' : '#ff4466';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height - 60, 300 * timePercent, 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 160);
        
        ctx.fillText('Round: ' + this.round, canvas.width / 2, 185);
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 48px Inter';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.fillText('Score: ' + this.score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Rounds: ' + this.round, canvas.width / 2, canvas.height / 2 + 55);
            ctx.font = '18px Inter';
            ctx.fillStyle = '#888';
            ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 100);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('colormatcher', ColorMatcher, {
        name: 'Color Matcher',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
