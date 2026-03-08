// Bouncer - Physics-based ball bouncing game
class Bouncer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 12 };
        this.paddle = { x: 0, y: 0, width: 100, height: 14 };
        this.bricks = [];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.ball = { x: canvas.width / 2, y: canvas.height - 60, vx: 180, vy: -280, radius: 12 };
        this.paddle = { x: canvas.width / 2 - 50, y: canvas.height - 30, width: 100, height: 14 };
        
        this.bricks = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.bricks.push({
                    x: 60 + col * 76,
                    y: 60 + row * 28,
                    width: 68,
                    height: 20,
                    color: ['#ff4466', '#ff8844', '#ffcc00', '#00ff88', '#00d4ff'][row],
                    alive: true
                });
            }
        }
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const mx = (e.clientX - rect.left) * scaleX;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, mx - this.paddle.width / 2));
        };
        
        this._handlers.click = () => {
            if (this.gameOver) this.init(this.canvas, this.ctx);
        };
        
        this.canvas.addEventListener('mousemove', this._handlers.mousemove);
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('mousemove', this._handlers.mousemove);
        this.canvas.removeEventListener('click', this._handlers.click);
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;
        
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -0.95;
            if (window.soundManager) window.soundManager.playHit();
        }
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -0.95;
            if (window.soundManager) window.soundManager.playHit();
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -0.95;
            if (window.soundManager) window.soundManager.playHit();
        }
        
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
            
            this.ball.y = this.paddle.y - this.ball.radius;
            this.ball.vy = -Math.abs(this.ball.vy);
            const hitPos = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
            this.ball.vx += hitPos * 150;
            this.ball.vy *= 1.02;
            this.score += 1;
            if (window.soundManager) window.soundManager.playJump();
        }
        
        if (this.ball.y > this.canvas.height + 20) {
            this.gameOver = true;
            this._unbindEvents();
            if (window.soundManager) window.soundManager.playDeath();
            return;
        }
        
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            if (this.ball.x + this.ball.radius > brick.x && 
                this.ball.x - this.ball.radius < brick.x + brick.width &&
                this.ball.y + this.ball.radius > brick.y && 
                this.ball.y - this.ball.radius < brick.y + brick.height) {
                
                brick.alive = false;
                const overlapLeft = (this.ball.x + this.ball.radius) - brick.x;
                const overlapRight = (brick.x + brick.width) - (this.ball.x - this.ball.radius);
                const overlapTop = (this.ball.y + this.ball.radius) - brick.y;
                const overlapBottom = (brick.y + brick.height) - (this.ball.y - this.ball.radius);
                
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                if (minOverlap === overlapLeft || minOverlap === overlapRight) this.ball.vx *= -1;
                else this.ball.vy *= -1;
                
                this.score += 10;
                if (window.soundManager) window.soundManager.playScore();
            }
        }
        
        if (this.bricks.every(b => !b.alive)) {
            this.gameOver = true;
            if (window.soundManager) window.soundManager.playLevelUp();
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            ctx.fillStyle = brick.color;
            ctx.shadowColor = brick.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 45);
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = this.bricks.every(b => !b.alive) ? '#00ff88' : '#ff4466';
            ctx.font = 'bold 48px Inter';
            ctx.fillText(this.bricks.every(b => !b.alive) ? 'YOU WIN!' : 'GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.fillText('Score: ' + this.score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.font = '18px Inter';
            ctx.fillStyle = '#888';
            ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 70);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('bouncer', Bouncer, {
        name: 'Bouncer',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
