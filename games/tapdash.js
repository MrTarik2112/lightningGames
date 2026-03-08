// Tap Dash - Rhythm tapping game
class TapDash {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.lanes = 4;
        this.notes = [];
        this.noteSpeed = 300;
        
        this.laneColors = ['#ff4466', '#00d4ff', '#00ff88', '#ffcc00'];
        
        this.hitEffects = [];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.notes = [];
        this.hitEffects = [];
        
        this._bindEvents();
        this._startSpawning();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (this.gameOver) return;
            
            let lane = -1;
            if (e.key === 'a' || e.key === 'A') lane = 0;
            if (e.key === 's' || e.key === 'S') lane = 1;
            if (e.key === 'd' || e.key === 'D') lane = 2;
            if (e.key === 'f' || e.key === 'F') lane = 3;
            
            if (lane >= 0) {
                this._checkHit(lane);
            }
        };
        
        this._handlers.click = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const laneWidth = this.canvas.width / this.lanes;
            const lane = Math.floor(mx / laneWidth);
            
            if (lane >= 0 && lane < this.lanes) {
                this._checkHit(lane);
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
        this.canvas.removeEventListener('click', this._handlers.click);
    }

    _startSpawning() {
        this._spawnTimer = setInterval(() => {
            if (this.gameOver) return;
            const lane = Math.floor(Math.random() * this.lanes);
            this.notes.push({
                lane,
                y: -30,
                hit: false,
                missed: false
            });
        }, 600);
    }

    _checkHit(lane) {
        const hitY = this.canvas.height - 80;
        
        for (const note of this.notes) {
            if (note.lane === lane && !note.hit && !note.missed) {
                const dist = Math.abs(note.y - hitY);
                
                if (dist < 50) {
                    note.hit = true;
                    this.score += 100;
                    this.hitEffects.push({
                        lane,
                        x: (lane + 0.5) * (this.canvas.width / this.lanes),
                        y: hitY,
                        life: 1
                    });
                    if (window.soundManager) window.soundManager.playScore();
                    break;
                }
            }
        }
    }

    update(dt) {
        if (this.gameOver) return;
        
        // Update notes
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            note.y += this.noteSpeed * dt;
            
            // Missed
            if (!note.hit && !note.missed && note.y > this.canvas.height - 30) {
                note.missed = true;
                this.score -= 20;
                if (window.soundManager) window.soundManager.playHit();
            }
            
            if (note.y > this.canvas.height + 50 || note.hit) {
                this.notes.splice(i, 1);
            }
        }
        
        // Game over if too many missed
        const missed = this.notes.filter(n => n.missed).length;
        if (missed >= 10) {
            this.gameOver = true;
            clearInterval(this._spawnTimer);
            this._unbindEvents();
        }
        
        // Hit effects
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const e = this.hitEffects[i];
            e.life -= dt * 3;
            if (e.life <= 0) this.hitEffects.splice(i, 1);
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#080810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const laneWidth = canvas.width / this.lanes;
        
        // Draw lanes
        for (let i = 0; i < this.lanes; i++) {
            const x = i * laneWidth;
            
            // Lane background
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fillRect(x, 0, laneWidth, canvas.height);
            
            // Lane line
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // Hit zone
            const hitY = canvas.height - 80;
            ctx.fillStyle = this.laneColors[i] + '30';
            ctx.fillRect(x + 5, hitY - 25, laneWidth - 10, 50);
            ctx.strokeStyle = this.laneColors[i];
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 5, hitY - 25, laneWidth - 10, 50);
            
            // Key label
            ctx.fillStyle = '#666';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(['A', 'S', 'D', 'F'][i], x + laneWidth / 2, hitY + 50);
        }
        
        // Draw notes
        for (const note of this.notes) {
            if (note.hit) continue;
            
            const x = note.lane * laneWidth + laneWidth / 2;
            ctx.fillStyle = note.missed ? '#666' : this.laneColors[note.lane];
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = note.missed ? 0 : 15;
            
            ctx.beginPath();
            ctx.arc(x, note.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Hit effects
        for (const e of this.hitEffects) {
            ctx.globalAlpha = e.life;
            ctx.strokeStyle = this.laneColors[e.lane];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 30 * (2 - e.life), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 40);
        
        const missed = this.notes.filter(n => n.missed).length;
        ctx.fillStyle = '#ff4466';
        ctx.font = '14px Inter';
        ctx.fillText('Missed: ' + missed + '/10', canvas.width / 2, 65);
        
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
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { 
        clearInterval(this._spawnTimer);
        this._unbindEvents(); 
    }
    resume() { 
        this._bindEvents();
        this._startSpawning();
    }
}

if (window.gameManager) {
    window.gameManager.registerGame('tapdash', TapDash, {
        name: 'Tap Dash',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
