// Light Cycle - Neon cycle survival
class LightCycle {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 0, y: 0, dir: 0, trail: [] };
        this.enemy = { x: 0, y: 0, dir: 0, trail: [] };
        this.speed = 250;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { 
            x: canvas.width / 4, 
            y: canvas.height / 2, 
            dir: 0, 
            trail: [{ x: canvas.width / 4, y: canvas.height / 2 }],
            color: '#00d4ff'
        };
        
        this.enemy = { 
            x: canvas.width * 3 / 4, 
            y: canvas.height / 2, 
            dir: 2,
            trail: [{ x: canvas.width * 3 / 4, y: canvas.height / 2 }],
            color: '#ff4466'
        };
        
        this.speed = 250;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const dirs = { 'ArrowUp': 0, 'ArrowRight': 1, 'ArrowDown': 2, 'ArrowLeft': 3 };
            if (dirs[e.code] !== undefined) {
                const newDir = dirs[e.code];
                if (Math.abs(newDir - this.player.dir) !== 2) {
                    this.player.dir = newDir;
                    if (window.soundManager) window.soundManager.playClick();
                }
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
    }

    update(dt) {
        if (this.gameOver) return;
        
        const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        
        const pDir = dirs[this.player.dir];
        this.player.x += pDir[0] * this.speed * dt;
        this.player.y += pDir[1] * this.speed * dt;
        
        if (this.player.x < 0 || this.player.x > this.canvas.width ||
            this.player.y < 0 || this.player.y > this.canvas.height) {
            this.gameOver = true;
            if (window.soundManager) window.soundManager.playDeath();
            this._unbindEvents();
            return;
        }
        
        const eDir = dirs[this.enemy.dir];
        this.enemy.x += eDir[0] * this.speed * dt;
        this.enemy.y += eDir[1] * this.speed * dt;
        
        if (this.enemy.x < 0 || this.enemy.x > this.canvas.width ||
            this.enemy.y < 0 || this.enemy.y > this.canvas.height) {
            this.gameOver = true;
            this.score += 100;
            if (window.soundManager) window.soundManager.playLevelUp();
            this._unbindEvents();
            return;
        }
        
        for (const t of this.player.trail) {
            if (Math.abs(this.player.x - t.x) < 15 && Math.abs(this.player.y - t.y) < 15) {
                this.gameOver = true;
                if (window.soundManager) window.soundManager.playDeath();
                this._unbindEvents();
                return;
            }
        }
        
        for (const t of this.enemy.trail) {
            if (Math.abs(this.player.x - t.x) < 15 && Math.abs(this.player.y - t.y) < 15) {
                this.gameOver = true;
                if (window.soundManager) window.soundManager.playDeath();
                this._unbindEvents();
                return;
            }
        }
        
        if (Math.abs(this.player.x - this.enemy.x) < 15 && Math.abs(this.player.y - this.enemy.y) < 15) {
            this.gameOver = true;
            if (window.soundManager) window.soundManager.playDeath();
            this._unbindEvents();
            return;
        }
        
        this.player.trail.push({ x: this.player.x, y: this.player.y });
        this.enemy.trail.push({ x: this.enemy.x, y: this.enemy.y });
        
        if (this.player.trail.length > 50) this.player.trail.shift();
        if (this.enemy.trail.length > 50) this.enemy.trail.shift();
        
        this.score += dt * 10;
        
        this.speed += dt * 5;
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        
        for (const t of this.player.trail) {
            ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
            ctx.fillRect(t.x - 4, t.y - 4, 8, 8);
        }
        
        for (const t of this.enemy.trail) {
            ctx.fillStyle = 'rgba(255, 68, 102, 0.4)';
            ctx.fillRect(t.x - 4, t.y - 4, 8, 8);
        }
        
        ctx.fillStyle = this.player.color;
        ctx.shadowColor = this.player.color;
        ctx.shadowBlur = 20;
        ctx.fillRect(this.player.x - 6, this.player.y - 6, 12, 12);
        
        ctx.fillStyle = this.enemy.color;
        ctx.shadowColor = this.enemy.color;
        ctx.fillRect(this.enemy.x - 6, this.enemy.y - 6, 12, 12);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Score: ' + Math.floor(this.score), canvas.width / 2, 45);
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 48px Inter';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.fillText('Score: ' + Math.floor(this.score), canvas.width / 2, canvas.height / 2 + 20);
            ctx.font = '18px Inter';
            ctx.fillStyle = '#888';
            ctx.fillText('Arrow Keys to move', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Arrow Keys to survive', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return Math.floor(this.score); }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('lightcycle', LightCycle, {
        name: 'Light Cycle',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
