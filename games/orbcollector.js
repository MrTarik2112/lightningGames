// Orb Collector - Tamamen yeniden yazıldı - SIFIR SALLANMA
class OrbCollectorGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = { x: 440, y: 270, r: 14 };
        this.speed = 4; // Sabit hız - dt ile çarpmıyoruz
        this.keys = { up: false, down: false, left: false, right: false };
        this.orbs = [];
        this.mines = [];
        this.particles = [];
        this.score = 0;
        this.gameOver = false;
        this.spawnTimer = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.player.x = canvas.width / 2;
        this.player.y = canvas.height / 2;
        this.orbs = [];
        this.mines = [];
        this.particles = [];
        this.spawnTimer = 0;
        
        // Event listeners
        this.keyDownHandler = (e) => this.handleKeyDown(e);
        this.keyUpHandler = (e) => this.handleKeyUp(e);
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        // İlk orb ve mine'ları spawn et
        for (let i = 0; i < 3; i++) this.spawnOrb();
        for (let i = 0; i < 2; i++) this.spawnMine();
    }

    handleKeyDown(e) {
        if (this.gameOver) return;
        const key = e.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') { this.keys.up = true; e.preventDefault(); }
        if (key === 'arrowdown' || key === 's') { this.keys.down = true; e.preventDefault(); }
        if (key === 'arrowleft' || key === 'a') { this.keys.left = true; e.preventDefault(); }
        if (key === 'arrowright' || key === 'd') { this.keys.right = true; e.preventDefault(); }
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') this.keys.up = false;
        if (key === 'arrowdown' || key === 's') this.keys.down = false;
        if (key === 'arrowleft' || key === 'a') this.keys.left = false;
        if (key === 'arrowright' || key === 'd') this.keys.right = false;
    }

    spawnOrb() {
        const margin = 30;
        this.orbs.push({
            x: margin + Math.random() * (this.canvas.width - margin * 2),
            y: margin + Math.random() * (this.canvas.height - margin * 2),
            r: 9
        });
    }

    spawnMine() {
        const margin = 30;
        this.mines.push({
            x: margin + Math.random() * (this.canvas.width - margin * 2),
            y: margin + Math.random() * (this.canvas.height - margin * 2),
            r: 13,
            phase: Math.random() * Math.PI * 2
        });
    }

    spawnParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        const p = this.player;
        
        // Pozisyonu kaydet (debug için)
        const oldX = p.x;
        const oldY = p.y;
        
        // ULTRA BASİT HAREKET - DT KULLANMIYORUZ
        if (this.keys.up) p.y -= this.speed;
        if (this.keys.down) p.y += this.speed;
        if (this.keys.left) p.x -= this.speed;
        if (this.keys.right) p.x += this.speed;

        // Sınırlar
        const margin = p.r;
        if (p.x < margin) p.x = margin;
        if (p.x > this.canvas.width - margin) p.x = this.canvas.width - margin;
        if (p.y < margin) p.y = margin;
        if (p.y > this.canvas.height - margin) p.y = this.canvas.height - margin;

        // Spawn timer
        this.spawnTimer += dt;
        if (this.spawnTimer > 1) {
            this.spawnTimer = 0;
            if (this.orbs.length < 4) this.spawnOrb();
            if (this.mines.length < 5) this.spawnMine();
        }

        // Mine animasyonu
        this.mines.forEach(m => m.phase += 0.05);

        // Orb toplama
        let orbCollected = false;
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const o = this.orbs[i];
            const dist = Math.hypot(o.x - p.x, o.y - p.y);
            if (dist < p.r + o.r) {
                this.orbs.splice(i, 1);
                this.score += 15;
                this.spawnParticles(o.x, o.y, '#ffdd55', 12);
                if (window.soundManager) window.soundManager.playEat();
                orbCollected = true;
                
                // Debug log
                console.log('Orb collected! Player pos:', p.x.toFixed(2), p.y.toFixed(2));
            }
        }

        // Mine çarpışması
        for (let m of this.mines) {
            const dist = Math.hypot(m.x - p.x, m.y - p.y);
            if (dist < p.r + m.r * 0.8) {
                this.endGame();
                break;
            }
        }

        // Partiküller
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pa = this.particles[i];
            pa.x += pa.vx;
            pa.y += pa.vy;
            pa.life -= 0.02;
            if (pa.life <= 0) this.particles.splice(i, 1);
        }
        
        // Debug: Pozisyon değişimini kontrol et
        if (orbCollected && (Math.abs(p.x - oldX) > this.speed || Math.abs(p.y - oldY) > this.speed)) {
            console.warn('ANORMAL HAREKET TESPIT EDİLDİ!', 
                'Delta X:', (p.x - oldX).toFixed(2), 
                'Delta Y:', (p.y - oldY).toFixed(2));
        }
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.spawnParticles(this.player.x, this.player.y, '#ff4466', 20);
        if (window.soundManager) window.soundManager.playDeath();
        if (window.gameManager) {
            window.gameManager.checkAndUpdateHighScore('orbcollector', this.score);
        }
        this.showGameOver();
    }

    showGameOver() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        let hs = 0;
        if (window.gameManager) hs = window.gameManager.getHighScore('orbcollector');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Collection Complete</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="orbcollector-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        
        const btn = overlay.querySelector('#orbcollector-restart');
        if (btn) {
            btn.addEventListener('click', () => {
                if (window.gameManager) window.gameManager.resetCurrentGame();
            });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        // Arka plan
        ctx.fillStyle = '#060616';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Orbs
        this.orbs.forEach(o => {
            ctx.shadowColor = '#ffdd55';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#ffdd55';
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Mines
        this.mines.forEach(m => {
            const pulse = 0.6 + Math.sin(m.phase) * 0.2;
            ctx.fillStyle = '#ff3355';
            ctx.shadowColor = '#ff3355';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r * pulse, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Player
        ctx.fillStyle = '#00e0ff';
        ctx.shadowColor = '#00e0ff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 20, 30);
    }

    getScore() {
        return this.score;
    }

    isGameOver() {
        return this.gameOver;
    }

    destroy() {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    }
}

// Oyunu kaydet
if (window.gameManager) {
    window.gameManager.registerGame('orbcollector', OrbCollectorGame, {
        name: 'Orb Collector',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
