// Sky Defender - Protect the sky from falling objects
class SkyDefender {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.tower = { x: 0, y: 0, height: 80, hp: 100, maxHp: 100 };
        this.projectiles = [];
        this.enemies = [];
        
        this.shootTimer = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.tower = { x: canvas.width / 2, y: canvas.height - 100, height: 80, hp: 100, maxHp: 100 };
        this.projectiles = [];
        this.enemies = [];
        this.shootTimer = 0;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.tower.x -= 30;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.tower.x += 30;
            }
            if (e.code === 'Space') {
                this._shoot();
            }
        };
        
        this._handlers.mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const mx = (e.clientX - rect.left) * scaleX;
            this.tower.x = mx;
        };
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
            } else {
                this._shoot();
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
        this.canvas.addEventListener('mousemove', this._handlers.mousemove);
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
        this.canvas.removeEventListener('mousemove', this._handlers.mousemove);
        this.canvas.removeEventListener('click', this._handlers.click);
    }

    _shoot() {
        this.projectiles.push({
            x: this.tower.x,
            y: this.tower.y - this.tower.height,
            vy: -500,
            radius: 6
        });
        if (window.soundManager) window.soundManager.playShoot();
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.tower.x = Math.max(50, Math.min(this.canvas.width - 50, this.tower.x));
        
        if (Math.random() < 0.025) {
            this.enemies.push({
                x: 50 + Math.random() * (this.canvas.width - 100),
                y: -30,
                vy: 60 + Math.random() * 40,
                radius: 18,
                hp: 1
            });
        }
        
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.y += p.vy * dt;
            
            if (p.y < -20) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const e = this.enemies[j];
                const dx = p.x - e.x;
                const dy = p.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < p.radius + e.radius) {
                    this.projectiles.splice(i, 1);
                    e.hp--;
                    
                    if (e.hp <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += 10;
                        if (window.soundManager) window.soundManager.playExplosion();
                    } else {
                        if (window.soundManager) window.soundManager.playHit();
                    }
                    break;
                }
            }
        }
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.y += e.vy * dt;
            
            if (e.y > this.tower.y) {
                this.enemies.splice(i, 1);
                this.tower.hp -= 10;
                
                if (this.tower.hp <= 0) {
                    this.gameOver = true;
                    this._unbindEvents();
                    if (window.soundManager) window.soundManager.playDeath();
                }
                if (window.soundManager) window.soundManager.playHit();
            }
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.fillRect(0, this.tower.y - this.tower.height, canvas.width, this.tower.height);
        
        const hpPercent = this.tower.hp / this.tower.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.tower.x - 40, this.tower.y - this.tower.height - 15, 80, 10);
        ctx.fillStyle = hpPercent > 0.5 ? '#00ff88' : hpPercent > 0.25 ? '#ffcc00' : '#ff4466';
        ctx.fillRect(this.tower.x - 40, this.tower.y - this.tower.height - 15, 80 * hpPercent, 10);
        
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(this.tower.x, this.tower.y - this.tower.height);
        ctx.lineTo(this.tower.x - 25, this.tower.y);
        ctx.lineTo(this.tower.x + 25, this.tower.y);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(this.tower.x, this.tower.y - this.tower.height - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        for (const p of this.projectiles) {
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        for (const e of this.enemies) {
            ctx.fillStyle = '#ff4466';
            ctx.shadowColor = '#ff4466';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👾', e.x, e.y);
        }
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 40);
        
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
            ctx.fillText('Move mouse, Click or Space to shoot', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('skydefender', SkyDefender, {
        name: 'Sky Defender',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
