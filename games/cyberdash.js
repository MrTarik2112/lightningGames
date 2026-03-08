// Cyber Dash - Fast paced neon obstacle avoidance
class CyberDashGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.player = { x: 0, y: 0, size: 24, targetX: 0, targetY: 0, speed: 15 };
        this.gridSize = 60;
        this.obstacles = [];
        this.pulses = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.difficulty = 1.0;
        this.gameTime = 0;
        this._keyHandler = null;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.difficulty = 1.0;
        this.gameTime = 0;

        // Center player
        this.player.x = Math.floor(canvas.width / 2 / this.gridSize) * this.gridSize + this.gridSize / 2;
        this.player.y = Math.floor(canvas.height / 2 / this.gridSize) * this.gridSize + this.gridSize / 2;
        this.player.targetX = this.player.x;
        this.player.targetY = this.player.y;

        this.obstacles = [];
        this.pulses = [];
        this.particles = [];
        this.spawnTimer = 0;

        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            const move = this.gridSize;
            if (e.key === 'ArrowLeft' || e.key === 'a') this.player.targetX -= move;
            if (e.key === 'ArrowRight' || e.key === 'd') this.player.targetX += move;
            if (e.key === 'ArrowUp' || e.key === 'w') this.player.targetY -= move;
            if (e.key === 'ArrowDown' || e.key === 's') this.player.targetY += move;

            // Clamp to grid
            this.player.targetX = Math.max(this.gridSize / 2, Math.min(this.canvas.width - this.gridSize / 2, this.player.targetX));
            this.player.targetY = Math.max(this.gridSize / 2, Math.min(this.canvas.height - this.gridSize / 2, this.player.targetY));
            
            if (window.soundManager) window.soundManager.playWhoosh();
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    _spawnObstacle() {
        const side = Math.floor(Math.random() * 4);
        const size = this.gridSize * (0.5 + Math.random() * 0.5);
        let x, y, vx, vy;

        if (side === 0) { // Top
            x = Math.random() * this.canvas.width;
            y = -size;
            vx = (Math.random() - 0.5) * 100;
            vy = (100 + Math.random() * 200) * this.difficulty;
        } else if (side === 1) { // Bottom
            x = Math.random() * this.canvas.width;
            y = this.canvas.height + size;
            vx = (Math.random() - 0.5) * 100;
            vy = (-100 - Math.random() * 200) * this.difficulty;
        } else if (side === 2) { // Left
            x = -size;
            y = Math.random() * this.canvas.height;
            vx = (100 + Math.random() * 200) * this.difficulty;
            vy = (Math.random() - 0.5) * 100;
        } else { // Right
            x = this.canvas.width + size;
            y = Math.random() * this.canvas.height;
            vx = (-100 - Math.random() * 200) * this.difficulty;
            vy = (Math.random() - 0.5) * 100;
        }

        this.obstacles.push({ x, y, size, vx, vy, color: '#00d4ff' });
    }

    _spawnPulse() {
        this.pulses.push({
            x: Math.random() * (this.canvas.width - 40) + 20,
            y: Math.random() * (this.canvas.height - 40) + 20,
            size: 8,
            life: 4.0
        });
    }

    _spawnParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1.0,
                decay: 2.0 + Math.random(),
                size: Math.random() * 3 + 1,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        this.gameTime += dt;
        this.difficulty = 1.0 + (this.gameTime / 30); // Increases difficulty over time

        // Smooth player movement
        this.player.x += (this.player.targetX - this.player.x) * this.player.speed * dt;
        this.player.y += (this.player.targetY - this.player.y) * this.player.speed * dt;

        // Spawn logic
        this.spawnTimer += dt;
        if (this.spawnTimer >= (0.4 / this.difficulty)) {
            this.spawnTimer = 0;
            this._spawnObstacle();
            if (Math.random() < 0.3) this._spawnPulse();
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.x += o.vx * dt;
            o.y += o.vy * dt;

            // Collision check
            const dx = o.x - this.player.x;
            const dy = o.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (o.size / 2 + this.player.size / 2)) {
                this._triggerGameOver();
                return;
            }

            // Cleanup
            if (o.x < -100 || o.x > this.canvas.width + 100 || o.y < -100 || o.y > this.canvas.height + 100) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update pulses
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const p = this.pulses[i];
            p.life -= dt;
            
            const dx = p.x - this.player.x;
            const dy = p.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < (p.size + this.player.size / 2)) {
                this.score += 50;
                this._spawnParticles(p.x, p.y, '#ff00ff', 15);
                if (window.soundManager) window.soundManager.playScore();
                this.pulses.splice(i, 1);
                continue;
            }

            if (p.life <= 0) this.pulses.splice(i, 1);
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Score over time
        this.score += Math.floor(dt * 10);
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid background
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += this.gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += this.gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw pulses
        this.pulses.forEach(p => {
            const glow = Math.sin(this.gameTime * 10) * 5 + 10;
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = glow;
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw obstacles
        this.obstacles.forEach(o => {
            ctx.shadowColor = o.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = o.color;
            ctx.fillRect(o.x - o.size / 2, o.y - o.size / 2, o.size, o.size);
        });

        // Draw player
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.player.x - this.player.size / 2, this.player.y - this.player.size / 2, this.player.size, this.player.size);

        // Draw particles
        ctx.shadowBlur = 0;
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    _triggerGameOver() {
        this.gameOver = true;
        this._spawnParticles(this.player.x, this.player.y, '#ffffff', 30);
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.onGameOver(this.score);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
}

window.gameManager.registerGame('cyberdash', CyberDashGame, {
    name: 'Cyber Dash',
    canvasWidth: 880,
    canvasHeight: 540
});
