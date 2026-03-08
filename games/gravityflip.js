// Gravity Flip - Survive by flipping gravity
class GravityFlip {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 0, y: 0, width: 32, height: 32, vy: 0 };
        this.gravityDir = 1;
        this.obstacles = [];
        this.particles = [];
        
        this.speed = 220;
        this.obstacleTimer = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 120, y: canvas.height / 2, width: 32, height: 32, vy: 0 };
        this.gravityDir = 1;
        this.obstacles = [];
        this.particles = [];
        this.speed = 220;
        this.obstacleTimer = 0;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            this.gravityDir *= -1;
            this.player.vy = this.gravityDir * 150;
            this._spawnParticles(this.player.x + 16, this.player.y + 16, this.gravityDir > 0 ? '#00d4ff' : '#ff00aa', 8);
            if (window.soundManager) window.soundManager.playFlip();
        };
        
        this._handlers.keydown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                this._handlers.click();
            }
        };
        
        this.canvas.addEventListener('click', this._handlers.click);
        document.addEventListener('keydown', this._handlers.keydown);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('click', this._handlers.click);
        document.removeEventListener('keydown', this._handlers.keydown);
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.player.vy += 900 * this.gravityDir * dt;
        this.player.y += this.player.vy * dt;
        
        if (this.player.y < 20) {
            this.player.y = 20;
            this.player.vy = 0;
        }
        if (this.player.y > this.canvas.height - 20) {
            this.player.y = this.canvas.height - 20;
            this.player.vy = 0;
        }
        
        this.obstacleTimer += dt;
        if (this.obstacleTimer > 1.4) {
            this.obstacleTimer = 0;
            const gapY = 100 + Math.random() * (this.canvas.height - 200);
            const gapHeight = 110;
            
            this.obstacles.push({
                x: this.canvas.width + 20,
                y: 0,
                width: 45,
                height: gapY - gapHeight / 2,
                passed: false
            });
            
            this.obstacles.push({
                x: this.canvas.width + 20,
                y: gapY + gapHeight / 2,
                width: 45,
                height: this.canvas.height - gapY - gapHeight / 2,
                passed: false
            });
            
            this.speed += 3;
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.speed * dt;
            
            if (this.player.x < obs.x + obs.width && 
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y) {
                
                this.gameOver = true;
                this._spawnParticles(this.player.x + 16, this.player.y + 16, '#ff4466', 20);
                if (window.soundManager) window.soundManager.playDeath();
                this._unbindEvents();
            }
            
            if (!obs.passed && obs.x + obs.width < this.player.x) {
                obs.passed = true;
                this.score++;
                if (window.soundManager) window.soundManager.playScore();
            }
            
            if (obs.x < -60) {
                this.obstacles.splice(i, 1);
            }
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 2;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: color
            });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        for (let y = 0; y < canvas.height; y += 35) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        
        ctx.fillStyle = this.gravityDir > 0 ? '#00d4ff' : '#ff00aa';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.gravityDir > 0 ? '▼' : '▲', 30, canvas.height / 2);
        
        const playerColor = this.gravityDir > 0 ? '#00d4ff' : '#ff00aa';
        ctx.fillStyle = playerColor;
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = 20;
        
        ctx.globalAlpha = 0.3;
        ctx.fillRect(this.player.x - 2, this.player.y - this.player.vy * 0.02, this.player.width, this.player.height);
        ctx.globalAlpha = 1;
        
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        ctx.shadowBlur = 0;
        
        for (const obs of this.obstacles) {
            ctx.fillStyle = '#ff4466';
            ctx.shadowColor = '#ff4466';
            ctx.shadowBlur = 12;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ff6688';
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
        
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 50);
        
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
            ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Click or Space to flip gravity', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('gravityflip', GravityFlip, {
        name: 'Gravity Flip',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
