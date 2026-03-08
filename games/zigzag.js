// Zig Zag - Draw zigzag path
class ZigZag {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.path = [];
        this.pathWidth = 40;
        this.direction = 1;
        this.speed = 250;
        
        this.stars = [];
        this.particles = [];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.path = [];
        this.direction = 1;
        this.speed = 250;
        
        // Start path
        this.path.push({ x: 0, y: canvas.height / 2 });
        
        this.stars = [];
        this.particles = [];
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            this.direction *= -1;
            this.path.push({ x: this.canvas.width, y: this.path[this.path.length - 1].y });
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
        
        // Move path
        for (const p of this.path) {
            p.x -= this.speed * dt;
        }
        
        // Remove old points
        if (this.path.length > 0 && this.path[0].x < -50) {
            this.path.shift();
        }
        
        // Change direction periodically
        if (Math.random() < dt * 0.5) {
            this.direction *= -1;
            this.path.push({ x: this.canvas.width, y: this.path[this.path.length - 1].y });
        }
        
        // Update path y
        for (let i = 1; i < this.path.length; i++) {
            this.path[i].y += this.direction * 100 * dt;
            this.path[i].y = Math.max(100, Math.min(this.canvas.height - 100, this.path[i].y));
        }
        
        // Spawn stars
        if (Math.random() < dt * 2) {
            this.stars.push({
                x: this.canvas.width + 20,
                y: 100 + Math.random() * (this.canvas.height - 200),
                collected: false
            });
        }
        
        // Update stars
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.x -= this.speed * dt;
            
            // Check collection
            if (!star.collected && this._isOnPath(star.x, star.y)) {
                star.collected = true;
                this.score += 5;
                this._spawnParticles(star.x, star.y);
                if (window.soundManager) window.soundManager.playScore();
            }
            
            if (star.x < -20) {
                this.stars.splice(i, 1);
            }
        }
        
        // Speed up
        this.speed += dt * 10;
        
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 2;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _isOnPath(x, y) {
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            
            if (x >= p1.x && x <= p2.x) {
                const t = (x - p1.x) / (p2.x - p1.x || 1);
                const py = p1.y + (p2.y - p1.y) * t;
                if (Math.abs(y - py) < this.pathWidth) {
                    return true;
                }
            }
        }
        return false;
    }

    _spawnParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: '#ffcc00'
            });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#080810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        for (const star of this.stars) {
            ctx.fillStyle = star.collected ? '#333' : '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = star.collected ? 0 : 10;
            
            // Star shape
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
                const r = 12;
                const px = star.x + Math.cos(angle) * r;
                const py = star.y + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Draw path
        if (this.path.length > 1) {
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = this.pathWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.moveTo(this.path[0].x, this.path[0].y);
            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i].x, this.path[i].y);
            }
            ctx.stroke();
            
            // Path edge glow
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Particles
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 40);
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 40px Inter';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Inter';
            ctx.fillText('Score: ' + this.score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 60);
        } else {
            ctx.fillStyle = '#666';
            ctx.font = '14px Inter';
            ctx.fillText('Click or Space to change direction', canvas.width / 2, canvas.height - 20);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('zigzag', ZigZag, {
        name: 'Zig Zag',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
