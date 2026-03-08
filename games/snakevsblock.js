// Snake VS Block - Destroy blocks with snake
class SnakeVsBlock {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.snake = { x: 0, y: 0, length: 5, segments: [] };
        this.blocks = [];
        
        this.moveDir = 0;
        this.blockSpeed = 150;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.snake = { 
            x: canvas.width / 2, 
            y: canvas.height - 150, 
            length: 5, 
            segments: [],
            direction: 0,
            targetDirection: 0
        };
        
        for (let i = 0; i < this.snake.length; i++) {
            this.snake.segments.push({ x: this.snake.x, y: this.snake.y + i * 15 });
        }
        
        this.blocks = [];
        this.blockSpeed = 150;
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.snake.targetDirection = -1;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.snake.targetDirection = 1;
        };
        
        this._handlers.click = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const mx = (e.clientX - rect.left) * scaleX;
            
            if (mx < this.canvas.width / 2) this.snake.targetDirection = -1;
            else this.snake.targetDirection = 1;
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
        this.canvas.addEventListener('mousedown', this._handlers.click);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
        this.canvas.removeEventListener('mousedown', this._handlers.click);
    }

    update(dt) {
        if (this.gameOver) return;
        
        if (this.snake.direction !== this.snake.targetDirection) {
            this.snake.direction = this.snake.targetDirection;
            if (window.soundManager) window.soundManager.playClick();
        }
        
        this.snake.x += this.snake.direction * 400 * dt;
        this.snake.x = Math.max(20, Math.min(this.canvas.width - 20, this.snake.x));
        
        for (let i = this.snake.segments.length - 1; i > 0; i--) {
            this.snake.segments[i].x = this.snake.segments[i - 1].x;
            this.snake.segments[i].y = this.snake.segments[i - 1].y;
        }
        this.snake.segments[0].x = this.snake.x;
        this.snake.segments[0].y = this.snake.y;
        
        if (Math.random() < 0.02) {
            const blockWidth = 40 + Math.random() * 60;
            const blockHp = 1 + Math.floor(Math.random() * 10);
            this.blocks.push({
                x: Math.random() * (this.canvas.width - blockWidth),
                y: -50,
                width: blockWidth,
                height: 25,
                hp: blockHp,
                maxHp: blockHp
            });
        }
        
        this.blockSpeed += dt * 2;
        
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const b = this.blocks[i];
            b.y += this.blockSpeed * dt;
            
            const head = this.snake.segments[0];
            if (head.x + 10 > b.x && head.x - 10 < b.x + b.width &&
                head.y < b.y + b.height && head.y + 10 > b.y) {
                
                if (this.snake.length > b.hp) {
                    b.hp -= this.snake.length;
                    this.snake.length -= b.hp;
                    this.score += b.maxHp * 10;
                    
                    if (this.snake.length < 1) {
                        this.gameOver = true;
                        this._unbindEvents();
                        if (window.soundManager) window.soundManager.playDeath();
                    }
                    
                    if (window.soundManager) window.soundManager.playExplosion();
                } else {
                    this.snake.length--;
                    b.hp--;
                    this.score += 10;
                    
                    if (b.hp <= 0) {
                        this.blocks.splice(i, 1);
                    }
                    
                    if (this.snake.length < 1) {
                        this.gameOver = true;
                        this._unbindEvents();
                        if (window.soundManager) window.soundManager.playDeath();
                    }
                    
                    if (window.soundManager) window.soundManager.playHit();
                }
            }
            
            if (b.y > this.canvas.height) {
                this.blocks.splice(i, 1);
            }
        }
        
        if (this.snake.segments.length > this.snake.length) {
            this.snake.segments.pop();
        }
        while (this.snake.segments.length < this.snake.length) {
            const last = this.snake.segments[this.snake.segments.length - 1];
            this.snake.segments.push({ x: last.x, y: last.y + 15 });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const b of this.blocks) {
            const hue = 120 - (b.hp / b.maxHp) * 120;
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 15;
            ctx.fillRect(b.x, b.y, b.width, b.height);
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.hp, b.x + b.width / 2, b.y + b.height / 2);
        }
        
        for (let i = this.snake.segments.length - 1; i >= 0; i--) {
            const seg = this.snake.segments[i];
            const alpha = 1 - (i / this.snake.segments.length) * 0.5;
            ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = i === 0 ? 20 : 0;
            
            const size = i === 0 ? 20 : 14;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Length: ' + this.snake.length, canvas.width / 2, 45);
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 75);
        
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
            ctx.fillText('Click or Arrow Keys to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Click left/right to move, hit blocks with more length', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('snakevsblock', SnakeVsBlock, {
        name: 'Snake VS Block',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
