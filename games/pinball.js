// Neon Pinball - Simple pinball game
class NeonPinball {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 8 };
        this.flippers = [];
        this.bumpers = [];
        this.pinballs = [];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.ball = { x: canvas.width - 50, y: canvas.height - 100, vx: -100, vy: -200, radius: 8 };
        
        this.flippers = [
            { x: 200, y: canvas.height - 60, angle: 0.4, length: 80, side: -1 },
            { x: 450, y: canvas.height - 60, angle: Math.PI - 0.4, length: 80, side: 1 }
        ];
        
        this.bumpers = [
            { x: 325, y: 180, radius: 25, color: '#ff4466', points: 100 },
            { x: 250, y: 280, radius: 20, color: '#ffcc00', points: 50 },
            { x: 400, y: 280, radius: 20, color: '#00ff88', points: 50 },
            { x: 325, y: 350, radius: 15, color: '#00d4ff', points: 25 }
        ];
        
        this.pinballs = [];
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.flippers[0].targetAngle = -0.4;
                if (window.soundManager) window.soundManager.playFlip();
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.flippers[1].targetAngle = Math.PI + 0.4;
                if (window.soundManager) window.soundManager.playFlip();
            }
            if (this.gameOver && e.code === 'Space') {
                this.init(this.canvas, this.ctx);
            }
        };
        
        this._handlers.keyup = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.flippers[0].targetAngle = 0.4;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.flippers[1].targetAngle = Math.PI - 0.4;
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
        document.addEventListener('keyup', this._handlers.keyup);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
        document.removeEventListener('keyup', this._handlers.keyup);
    }

    update(dt) {
        for (const flipper of this.flippers) {
            flipper.angle += (flipper.targetAngle - flipper.angle) * 15 * dt;
        }
        
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;
        
        if (this.ball.x < this.ball.radius) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -0.9;
        }
        if (this.ball.x > this.canvas.width - this.ball.radius) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -0.9;
        }
        if (this.ball.y < this.ball.radius) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -0.9;
        }
        
        for (const bumper of this.bumpers) {
            const dx = this.ball.x - bumper.x;
            const dy = this.ball.y - bumper.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < bumper.radius + this.ball.radius) {
                const nx = dx / dist;
                const ny = dy / dist;
                const dot = this.ball.vx * nx + this.ball.vy * ny;
                this.ball.vx = this.ball.vx - 2 * dot * nx;
                this.ball.vy = this.ball.vy - 2 * dot * ny;
                
                const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
                this.ball.vx = (this.ball.vx / speed) * 400;
                this.ball.vy = (this.ball.vy / speed) * 400;
                
                this.ball.x = bumper.x + nx * (bumper.radius + this.ball.radius + 2);
                this.ball.y = bumper.y + ny * (bumper.radius + this.ball.radius + 2);
                
                this.score += bumper.points;
                if (window.soundManager) window.soundManager.playScore();
            }
        }
        
        for (const flipper of this.flippers) {
            const cos = Math.cos(flipper.angle);
            const sin = Math.sin(flipper.angle);
            
            const dx = this.ball.x - flipper.x;
            const dy = this.ball.y - flipper.y;
            
            const flipperNx = -sin * flipper.side;
            const flipperNy = cos * flipper.side;
            
            const proj = dx * flipperNx + dy * flipperNy;
            const perpDist = dx * cos + dy * sin;
            
            if (proj > 0 && proj < flipper.length && Math.abs(perpDist) < this.ball.radius + 8) {
                const dot = this.ball.vx * flipperNx + this.ball.vy * flipperNy;
                
                if (dot < 0) {
                    this.ball.vx -= 1.5 * dot * flipperNx;
                    this.ball.vy -= 1.5 * dot * flipperNy;
                    this.ball.vy -= 200;
                    
                    if (window.soundManager) window.soundManager.playHit();
                }
            }
        }
        
        if (this.ball.y > this.canvas.height + 20) {
            this.gameOver = true;
            this._unbindEvents();
            if (window.soundManager) window.soundManager.playDeath();
        }
        
        this.ball.vy += 600 * dt;
        
        const maxSpeed = 500;
        const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        if (speed > maxSpeed) {
            this.ball.vx = (this.ball.vx / speed) * maxSpeed;
            this.ball.vy = (this.ball.vy / speed) * maxSpeed;
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(150, canvas.height - 80, 580, 80);
        
        for (const bumper of this.bumpers) {
            ctx.fillStyle = bumper.color;
            ctx.shadowColor = bumper.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        for (const flipper of this.flippers) {
            ctx.save();
            ctx.translate(flipper.x, flipper.y);
            ctx.rotate(flipper.angle);
            
            ctx.fillStyle = '#00d4ff';
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 15;
            ctx.fillRect(0, -6, flipper.length, 12);
            
            ctx.restore();
        }
        
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 45);
        
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
            ctx.fillText('Left/Right Arrows to flip', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('pinball', NeonPinball, {
        name: 'Neon Pinball',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
