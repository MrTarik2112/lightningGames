// Neon Duel - 2 Player Local Pong
class NeonDuelGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.p1Score = 0;
        this.p2Score = 0;
        this.gameOver = false;
        this.winner = null;

        this.p1 = { x: 30, y: 0, w: 12, h: 90, speed: 500, score: 0 };
        this.p2 = { x: 0, y: 0, w: 12, h: 90, speed: 500, score: 0 };
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, r: 8, speed: 450 };

        this.particles = [];
        this.keys = {};
        this._keyDown = null;
        this._keyUp = null;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.p1Score = 0;
        this.p2Score = 0;
        this.gameOver = false;
        this.winner = null;

        this.p1.y = canvas.height / 2 - this.p1.h / 2;
        this.p2.x = canvas.width - 30 - this.p2.w;
        this.p2.y = canvas.height / 2 - this.p2.h / 2;

        this._resetBall();
        this.particles = [];
        this.keys = {};
        this._bindKeys();
    }

    _resetBall(dir = 1) {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.vx = dir * this.ball.speed;
        this.ball.vy = (Math.random() - 0.5) * 400;
    }

    _bindKeys() {
        this._keyDown = (e) => { this.keys[e.key] = true; };
        this._keyUp = (e) => { this.keys[e.key] = false; };
        document.addEventListener('keydown', this._keyDown);
        document.addEventListener('keyup', this._keyUp);
    }

    _spawnParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 1.0,
                decay: 2.0 + Math.random(),
                size: Math.random() * 4 + 1,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        // P1 Controls (W/S)
        if (this.keys['w'] || this.keys['W']) this.p1.y -= this.p1.speed * dt;
        if (this.keys['s'] || this.keys['S']) this.p1.y += this.p1.speed * dt;
        
        // P2 Controls (Arrows)
        if (this.keys['ArrowUp']) this.p2.y -= this.p2.speed * dt;
        if (this.keys['ArrowDown']) this.p2.y += this.p2.speed * dt;

        // Constrain paddles
        this.p1.y = Math.max(0, Math.min(this.canvas.height - this.p1.h, this.p1.y));
        this.p2.y = Math.max(0, Math.min(this.canvas.height - this.p2.h, this.p2.y));

        // Ball movement
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;

        // Ball wall collisions
        if (this.ball.y - this.ball.r < 0 || this.ball.y + this.ball.r > this.canvas.height) {
            this.ball.vy *= -1;
            if (window.soundManager) { window.soundManager.playBounce(); window.soundManager.playHit(); }
        }

        // Ball paddle collisions
        // P1
        if (this.ball.vx < 0 && 
            this.ball.x - this.ball.r < this.p1.x + this.p1.w &&
            this.ball.y > this.p1.y && this.ball.y < this.p1.y + this.p1.h) {
            
            this.ball.vx *= -1.05; // Speed up
            this.ball.vy += (this.ball.y - (this.p1.y + this.p1.h/2)) * 5;
            this._spawnParticles(this.ball.x, this.ball.y, '#00d4ff');
            if (window.soundManager) window.soundManager.playScore();
        }
        
        // P2
        if (this.ball.vx > 0 && 
            this.ball.x + this.ball.r > this.p2.x &&
            this.ball.y > this.p2.y && this.ball.y < this.p2.y + this.p2.h) {
            
            this.ball.vx *= -1.05;
            this.ball.vy += (this.ball.y - (this.p2.y + this.p2.h/2)) * 5;
            this._spawnParticles(this.ball.x, this.ball.y, '#ff00aa');
            if (window.soundManager) window.soundManager.playScore();
        }

        // Scoring
        if (this.ball.x < 0) {
            this.p2Score++;
            this._resetBall(1);
            if (window.bgPulse) window.bgPulse(null, null, [255, 0, 170]);
        } else if (this.ball.x > this.canvas.width) {
            this.p1Score++;
            this._resetBall(-1);
            if (window.bgPulse) window.bgPulse(null, null, [0, 212, 255]);
        }

        if (this.p1Score >= 5 || this.p2Score >= 5) {
            this.winner = this.p1Score >= 5 ? 'Player 1' : 'Player 2';
            this._triggerGameOver();
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Center line
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Scores
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '900 80px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.p1Score, canvas.width * 0.25, canvas.height / 2 + 30);
        ctx.fillText(this.p2Score, canvas.width * 0.75, canvas.height / 2 + 30);

        // P1
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(this.p1.x, this.p1.y, this.p1.w, this.p1.h);

        // P2
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff00aa';
        ctx.fillRect(this.p2.x, this.p2.y, this.p2.w, this.p2.h);

        // Ball
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
        ctx.fill();

        // Particles
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
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.onGameOver(this.getScore());
    }

    getScore() { return Math.max(this.p1Score, this.p2Score); }
    isGameOver() { return this.gameOver; }
}

window.gameManager.registerGame('neonduel', NeonDuelGame, {
    name: 'Neon Duel',
    canvasWidth: 880,
    canvasHeight: 540
});
