// Ball Blast clone - Shoot bullets, destroy falling rocks
class BallBlast {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 0, y: 0, width: 40, height: 40 };
        this.bullets = [];
        this.rocks = [];
        
        this.shootTimer = 0;
        this.rockTimer = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: canvas.width / 2 - 20, y: canvas.height - 80, width: 40, height: 40 };
        this.bullets = [];
        this.rocks = [];
        this.shootTimer = 0;
        this.rockTimer = 0;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const mx = (e.clientX - rect.left) * scaleX;
            this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, mx - this.player.width / 2));
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
        
        this.shootTimer += dt;
        if (this.shootTimer >= 0.08) {
            this.shootTimer = 0;
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 3,
                y: this.player.y,
                width: 6,
                height: 15,
                speed: 600
            });
            if (window.soundManager) window.soundManager.playShoot();
        }
        
        this.rockTimer += dt;
        if (this.rockTimer >= 0.8) {
            this.rockTimer = 0;
            const size = 25 + Math.random() * 35;
            this.rocks.push({
                x: Math.random() * (this.canvas.width - size),
                y: -size,
                width: size,
                height: size,
                speed: 80 + Math.random() * 60,
                hp: Math.ceil(size / 15),
                maxHp: Math.ceil(size / 15)
            });
        }
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= b.speed * dt;
            
            if (b.y < -20) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            for (let j = this.rocks.length - 1; j >= 0; j--) {
                const r = this.rocks[j];
                if (b.x < r.x + r.width && b.x + b.width > r.x &&
                    b.y < r.y + r.height && b.y + b.height > r.y) {
                    
                    this.bullets.splice(i, 1);
                    r.hp--;
                    
                    if (r.hp <= 0) {
                        this.rocks.splice(j, 1);
                        this.score += r.maxHp * 10;
                        if (window.soundManager) window.soundManager.playExplosion();
                    } else {
                        if (window.soundManager) window.soundManager.playHit();
                    }
                    break;
                }
            }
        }
        
        for (let i = this.rocks.length - 1; i >= 0; i--) {
            const r = this.rocks[i];
            r.y += r.speed * dt;
            
            if (r.y > this.canvas.height) {
                this.rocks.splice(i, 1);
                continue;
            }
            
            if (r.x < this.player.x + this.player.width && r.x + r.width > this.player.x &&
                r.y < this.player.y + this.player.height && r.y + r.height > this.player.y) {
                
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
        
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        ctx.shadowBlur = 0;
        
        for (const b of this.bullets) {
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 10;
            ctx.fillRect(b.x, b.y, b.width, b.height);
        }
        ctx.shadowBlur = 0;
        
        for (const r of this.rocks) {
            const hue = 0 + (r.hp / r.maxHp) * 60;
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(r.x + r.width / 2, r.y + r.height / 2, r.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            if (r.hp < r.maxHp) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(r.hp, r.x + r.width / 2, r.y + r.height / 2);
            }
        }
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
            ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Move mouse to aim and shoot', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('ballblast', BallBlast, {
        name: 'Ball Blast',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
