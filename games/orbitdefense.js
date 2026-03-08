// Orbit Defense - Protect the center!
class OrbitDefense {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.center = { x: 0, y: 0 };
        this.orbitRadius = 130;
        this.angle = 0;
        
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        
        this.enemySpeed = 70;
        this.spawnTimer = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.center = { x: canvas.width / 2, y: canvas.height / 2 };
        this.angle = 0;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.enemySpeed = 70;
        this.spawnTimer = 0;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const my = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.angle = Math.atan2(my - this.center.y, mx - this.center.x);
        };
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            const bx = this.center.x + Math.cos(this.angle) * this.orbitRadius;
            const by = this.center.y + Math.sin(this.angle) * this.orbitRadius;
            
            this.bullets.push({
                x: bx,
                y: by,
                vx: Math.cos(this.angle) * 650,
                vy: Math.sin(this.angle) * 650,
                trail: []
            });
            
            this._spawnParticles(bx, by, '#ffcc00', 5);
            if (window.soundManager) window.soundManager.playShoot();
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
        
        this.spawnTimer += dt;
        if (this.spawnTimer > 1.3) {
            this.spawnTimer = 0;
            const angle = Math.random() * Math.PI * 2;
            const dist = 420;
            
            this.enemies.push({
                x: this.center.x + Math.cos(angle) * dist,
                y: this.center.y + Math.sin(angle) * dist,
                angle: angle
            });
            
            this.enemySpeed += 0.5;
        }
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.angle = Math.atan2(this.center.y - e.y, this.center.x - e.x);
            e.x += Math.cos(e.angle) * this.enemySpeed * dt;
            e.y += Math.sin(e.angle) * this.enemySpeed * dt;
            
            const dist = Math.hypot(e.x - this.center.x, e.y - this.center.y);
            if (dist < 35) {
                this.gameOver = true;
                this._spawnParticles(this.center.x, this.center.y, '#ff4466', 30);
                if (window.soundManager) window.soundManager.playDeath();
                this._unbindEvents();
            }
        }
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.trail.push({ x: b.x, y: b.y });
            if (b.trail.length > 8) b.trail.shift();
            
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const e = this.enemies[j];
                const dist = Math.hypot(b.x - e.x, b.y - e.y);
                
                if (dist < 22) {
                    this.score += 10;
                    this._spawnParticles(e.x, e.y, '#ff8844', 12);
                    this.enemies.splice(j, 1);
                    this.bullets.splice(i, 1);
                    
                    if (window.soundManager) window.soundManager.playExplosion();
                    break;
                }
            }
            
            if (b.x < -50 || b.x > this.canvas.width + 50 || b.y < -50 || b.y > this.canvas.height + 50) {
                this.bullets.splice(i, 1);
            }
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= dt * 1.5;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 180;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: color,
                size: 2 + Math.random() * 4
            });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        for (const b of this.bullets) {
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            if (b.trail.length > 0) {
                ctx.moveTo(b.trail[0].x, b.trail[0].y);
                for (const t of b.trail) ctx.lineTo(t.x, t.y);
                ctx.lineTo(b.x, b.y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 12;
        for (const b of this.bullets) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        for (const e of this.enemies) {
            ctx.fillStyle = '#ff4466';
            ctx.shadowColor = '#ff4466';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff8844';
            ctx.beginPath();
            ctx.arc(e.x, e.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        const turretX = this.center.x + Math.cos(this.angle) * this.orbitRadius;
        const turretY = this.center.y + Math.sin(this.angle) * this.orbitRadius;
        
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(turretX, turretY, 14, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(turretX, turretY);
        ctx.lineTo(turretX + Math.cos(this.angle) * 25, turretY + Math.sin(this.angle) * 25);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#aaffaa';
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
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
            ctx.fillText('Mouse to aim, Click to shoot', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('orbitdefense', OrbitDefense, {
        name: 'Orbit Defense',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
