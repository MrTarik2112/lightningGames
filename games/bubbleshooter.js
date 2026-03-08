// Bubble Shooter - Match 3 bubbles
class BubbleShooter {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.bubbles = [];
        this.shooter = { x: 0, y: 0, angle: -Math.PI / 2, nextColor: '' };
        this.currentBubble = null;
        this.colors = ['#ff4466', '#00d4ff', '#00ff88', '#ffcc00', '#ff00aa'];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.bubbles = [];
        this.shooter = { x: canvas.width / 2, y: canvas.height - 40, angle: -Math.PI / 2, nextColor: '' };
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 10; col++) {
                const offset = row % 2 === 0 ? 0 : 25;
                this.bubbles.push({
                    x: 50 + col * 55 + offset,
                    y: 60 + row * 48,
                    radius: 22,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    row, col
                });
            }
        }
        
        this._createNewBubble();
        this._bindEvents();
    }

    _createNewBubble() {
        this.currentBubble = {
            x: this.shooter.x,
            y: this.shooter.y,
            vx: 0,
            vy: 0,
            color: this.shooter.nextColor || this.colors[Math.floor(Math.random() * this.colors.length)],
            radius: 22,
            moving: false
        };
        this.shooter.nextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const mx = (e.clientX - rect.left) * scaleX;
            this.shooter.angle = Math.atan2(mx - this.shooter.x, this.shooter.y);
        };
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            if (!this.currentBubble.moving) {
                this.currentBubble.moving = true;
                this.currentBubble.vx = Math.sin(this.shooter.angle) * 600;
                this.currentBubble.vy = -Math.cos(this.shooter.angle) * 600;
                if (window.soundManager) window.soundManager.playShoot();
            }
        };
        
        this.canvas.addEventListener('mousemove', this._handlers.mousemove);
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('mousemove', this._handlers.mousemove);
        this.canvas.removeEventListener('click', this._handlers.click);
    }

    _snapBubble(bubble) {
        let closest = null;
        let minDist = Infinity;
        
        for (const b of this.bubbles) {
            const dx = bubble.x - b.x;
            const dy = bubble.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                closest = b;
            }
        }
        
        if (closest) {
            const angle = Math.atan2(bubble.y - closest.y, bubble.x - closest.x);
            bubble.x = closest.x + Math.cos(angle) * 44;
            bubble.y = closest.y + Math.sin(angle) * 44;
        }
        
        const newRow = Math.round((bubble.y - 60) / 48);
        const offset = newRow % 2 === 0 ? 0 : 25;
        const newCol = Math.round((bubble.x - 50 - offset) / 55);
        
        bubble.row = newRow;
        bubble.col = newCol;
        
        this.bubbles.push(bubble);
        
        this._checkMatches(bubble);
    }

    _checkMatches(bubble) {
        const matches = [bubble];
        const visited = new Set();
        const queue = [bubble];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.row},${current.col}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            for (const b of this.bubbles) {
                if (b === current) continue;
                if (b.color !== bubble.color) continue;
                
                const dx = Math.abs(b.row - current.row);
                const dy = Math.abs(b.col - current.col);
                
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (current.row % 2 === 0 ? (dx === 1 && dy === 1) : (dx === 1 && dy === 1))) {
                    if (!visited.has(`${b.row},${b.col}`)) {
                        matches.push(b);
                        queue.push(b);
                    }
                }
            }
        }
        
        if (matches.length >= 3) {
            for (const m of matches) {
                const idx = this.bubbles.indexOf(m);
                if (idx !== -1) {
                    this.bubbles.splice(idx, 1);
                }
            }
            this.score += matches.length * 10;
            if (window.soundManager) window.soundManager.playScore();
            
            this._dropFloating();
        }
    }

    _dropFloating() {
        const connected = new Set();
        const queue = [this.bubbles[0]];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.row},${current.col}`;
            
            if (connected.has(key)) continue;
            connected.add(key);
            
            for (const b of this.bubbles) {
                if (connected.has(`${b.row},${b.col}`)) continue;
                
                const dx = Math.abs(b.row - current.row);
                const dy = Math.abs(b.col - current.col);
                
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (current.row % 2 === 0 ? (dx === 1 && dy === 1) : (dx === 1 && dy === 1))) {
                    queue.push(b);
                }
            }
        }
        
        let dropped = 0;
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            if (!connected.has(`${b.row},${b.col}`)) {
                this.bubbles.splice(i, 1);
                dropped++;
            }
        }
        
        if (dropped > 0) {
            this.score += dropped * 20;
            if (window.soundManager) window.soundManager.playExplosion();
        }
        
        if (this.bubbles.length === 0) {
            this.score += 1000;
            if (window.soundManager) window.soundManager.playLevelUp();
        }
    }

    update(dt) {
        if (this.gameOver) return;
        
        if (this.currentBubble && this.currentBubble.moving) {
            this.currentBubble.x += this.currentBubble.vx * dt;
            this.currentBubble.y += this.currentBubble.vy * dt;
            
            if (this.currentBubble.x < 25 || this.currentBubble.x > this.canvas.width - 25) {
                this.currentBubble.vx *= -1;
                this.currentBubble.x = Math.max(25, Math.min(this.canvas.width - 25, this.currentBubble.x));
            }
            
            if (this.currentBubble.y < 25) {
                this._snapBubble(this.currentBubble);
                this._createNewBubble();
            }
            
            for (const b of this.bubbles) {
                const dx = this.currentBubble.x - b.x;
                const dy = this.currentBubble.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 44) {
                    this._snapBubble(this.currentBubble);
                    this._createNewBubble();
                    break;
                }
            }
        }
        
        for (const b of this.bubbles) {
            if (b.y > this.canvas.height - 80) {
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
        
        for (let i = 0; i < 8; i++) {
            const y = 60 + i * 48;
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        for (const b of this.bubbles) {
            const gradient = ctx.createRadialGradient(b.x - 5, b.y - 5, 0, b.x, b.y, b.radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.3, b.color);
            gradient.addColorStop(1, b.color);
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        if (this.currentBubble) {
            const b = this.currentBubble;
            const gradient = ctx.createRadialGradient(b.x - 5, b.y - 5, 0, b.x, b.y, b.radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.3, b.color);
            gradient.addColorStop(1, b.color);
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.shooter.x, this.shooter.y);
            ctx.lineTo(
                this.shooter.x + Math.sin(this.shooter.angle) * 50,
                this.shooter.y - Math.cos(this.shooter.angle) * 50
            );
            ctx.stroke();
        }
        
        ctx.fillStyle = this.shooter.nextColor;
        ctx.beginPath();
        ctx.arc(60, canvas.height - 30, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('NEXT', 60, canvas.height - 10);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 35);
        
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
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('bubbleshooter', BubbleShooter, {
        name: 'Bubble Shooter',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
