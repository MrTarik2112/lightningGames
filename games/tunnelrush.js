// Tunnel Rush - Navigate through rotating tunnel
class TunnelRush {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.angle = 0;
        this.tunnelAngle = 0;
        this.playerAngle = 0;
        this.speed = 2;
        this.obstacles = [];
        this.distance = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.angle = 0;
        this.tunnelAngle = 0;
        this.playerAngle = 0;
        this.speed = 2;
        this.obstacles = [];
        this.distance = 0;
        
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
                this.playerAngle -= 0.15;
                if (window.soundManager) window.soundManager.playClick();
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.playerAngle += 0.15;
                if (window.soundManager) window.soundManager.playClick();
            }
        };
        
        this._handlers.click = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const mx = (e.clientX - rect.left) * scaleX;
            
            if (mx < this.canvas.width / 2) {
                this.playerAngle -= 0.15;
            } else {
                this.playerAngle += 0.15;
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
        this.canvas.removeEventListener('click', this._handlers.click);
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.tunnelAngle += this.speed * dt;
        this.speed += dt * 0.1;
        this.distance += this.speed * dt * 50;
        this.score = Math.floor(this.distance / 10);
        
        if (Math.random() < 0.03) {
            const numObstacles = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numObstacles; i++) {
                this.obstacles.push({
                    angle: Math.random() * Math.PI * 2,
                    distance: 300,
                    width: 0.3 + Math.random() * 0.4,
                    type: Math.random() < 0.5 ? 'barrier' : 'rotating'
                });
            }
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.distance -= this.speed * dt * 200;
            
            if (obs.type === 'rotating') {
                obs.angle += dt * 2;
            }
            
            if (obs.distance < 20) {
                let playerInRange = false;
                
                if (obs.type === 'barrier') {
                    const angleDiff = Math.abs(this._normalizeAngle(this.playerAngle - obs.angle));
                    if (angleDiff < obs.width / 2 || angleDiff > Math.PI * 2 - obs.width / 2) {
                        playerInRange = true;
                    }
                } else {
                    const angleDiff = Math.abs(this._normalizeAngle(this.playerAngle - obs.angle));
                    if (angleDiff < 0.2) {
                        playerInRange = true;
                    }
                }
                
                if (playerInRange) {
                    this.gameOver = true;
                    this._unbindEvents();
                    if (window.soundManager) window.soundManager.playDeath();
                }
                
                this.obstacles.splice(i, 1);
                if (window.soundManager) window.soundManager.playScore();
            }
        }
    }

    _normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        for (let i = 5; i > 0; i--) {
            const radius = 30 + i * 30;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 - i * 0.015})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.tunnelAngle);
        
        for (const obs of this.obstacles) {
            const radius = obs.distance;
            
            if (obs.type === 'barrier') {
                ctx.beginPath();
                ctx.arc(0, 0, radius, obs.angle - obs.width / 2, obs.angle + obs.width / 2);
                ctx.strokeStyle = '#ff4466';
                ctx.lineWidth = 20;
                ctx.shadowColor = '#ff4466';
                ctx.shadowBlur = 20;
                ctx.stroke();
            } else {
                ctx.save();
                ctx.rotate(obs.angle);
                ctx.fillStyle = '#ffcc00';
                ctx.shadowColor = '#ffcc00';
                ctx.shadowBlur = 15;
                ctx.fillRect(-15, -radius - 10, 30, 20);
                ctx.restore();
            }
        }
        ctx.shadowBlur = 0;
        ctx.restore();
        
        const playerRadius = 30;
        const playerX = cx + Math.sin(this.playerAngle) * playerRadius;
        const playerY = cy + Math.cos(this.playerAngle) * playerRadius;
        
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(playerX, playerY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 45);
        
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
            ctx.fillText('Click left/right to dodge obstacles', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('tunnelrush', TunnelRush, {
        name: 'Tunnel Rush',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
