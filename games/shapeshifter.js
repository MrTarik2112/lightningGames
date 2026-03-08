// Shape Shifter - Change shape to fit
class ShapeShifter {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 0, y: 0, shape: 0, size: 50 };
        this.holes = [];
        this.speed = 200;
        
        this.shapes = ['circle', 'square', 'triangle'];
        this.shapeSize = 50;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 100, y: canvas.height / 2, shape: 0 };
        this.holes = [];
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            this.player.shape = (this.player.shape + 1) % 3;
            if (window.soundManager) window.soundManager.playFlip();
        };
        
        this._handlers.keydown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                this._handlers.click();
            }
        };
        
        this.canvas.addEventListener('click', this._handlers.click);
        document.addEventListener('keydown', this._handlers.keydown);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('click', this._handlers.click);
        document.removeEventListener('keydown', this._handlers.keydown);
    }

    update(dt) {
        if (this.gameOver) return;
        
        // Move holes toward player
        for (let i = this.holes.length - 1; i >= 0; i--) {
            const hole = this.holes[i];
            hole.x -= this.speed * dt;
            
            // Check collision
            if (hole.x < this.player.x + this.player.size && 
                hole.x + hole.size > this.player.x - this.player.size) {
                
                if (!hole.passed) {
                    const fits = this._checkFit(this.player.shape, hole.shape);
                    
                    if (fits) {
                        this.score += 10;
                        hole.passed = true;
                        if (window.soundManager) window.soundManager.playScore();
                    } else {
                        this.gameOver = true;
                        if (window.soundManager) window.soundManager.playDeath();
                        this._unbindEvents();
                    }
                }
            }
            
            if (hole.x < -100) {
                this.holes.splice(i, 1);
            }
        }
        
        // Spawn holes
        if (Math.random() < dt * 1.2) {
            const shape = Math.floor(Math.random() * 3);
            this.holes.push({
                x: this.canvas.width + 50,
                y: this.canvas.height / 2,
                size: 60,
                shape,
                passed: false
            });
            this.speed += dt * 5;
        }
    }

    _checkFit(playerShape, holeShape) {
        // Circle fits circle, square fits square, triangle fits triangle
        return playerShape === holeShape;
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#080810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw holes
        for (const hole of this.holes) {
            ctx.fillStyle = '#080810';
            ctx.strokeStyle = hole.passed ? '#00ff88' : '#ff4466';
            ctx.lineWidth = 3;
            
            const y = hole.y;
            const size = hole.size;
            
            if (hole.shape === 0) { // Circle
                ctx.beginPath();
                ctx.arc(hole.x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else if (hole.shape === 1) { // Square
                ctx.fillRect(hole.x - size / 2, y - size / 2, size, size);
                ctx.strokeRect(hole.x - size / 2, y - size / 2, size, size);
            } else { // Triangle
                ctx.beginPath();
                ctx.moveTo(hole.x, y - size / 2);
                ctx.lineTo(hole.x + size / 2, y + size / 2);
                ctx.lineTo(hole.x - size / 2, y + size / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        
        // Draw player
        const px = this.player.x;
        const py = this.player.y;
        const size = this.player.size;
        
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        
        if (this.player.shape === 0) { // Circle
            ctx.beginPath();
            ctx.arc(px, py, size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.player.shape === 1) { // Square
            ctx.fillRect(px - size / 2, py - size / 2, size, size);
        } else { // Triangle
            ctx.beginPath();
            ctx.moveTo(px, py - size / 2);
            ctx.lineTo(px + size / 2, py + size / 2);
            ctx.lineTo(px - size / 2, py + size / 2);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        // Shape indicators
        ctx.textAlign = 'center';
        ctx.font = '12px Inter';
        ctx.fillStyle = '#666';
        const laneWidth = canvas.width / 3;
        ctx.fillText('○ Circle', laneWidth / 2, canvas.height - 40);
        ctx.fillText('□ Square', laneWidth * 1.5, canvas.height - 40);
        ctx.fillText('△ Triangle', laneWidth * 2.5, canvas.height - 40);
        
        // Current shape indicator
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 14px Inter';
        ctx.fillText('▲', laneWidth * (this.player.shape + 0.5), canvas.height - 20);
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 40);
        
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
        } else {
            ctx.fillStyle = '#666';
            ctx.font = '14px Inter';
            ctx.fillText('Click or Space to change shape', canvas.width / 2, 70);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('shapeshifter', ShapeShifter, {
        name: 'Shape Shifter',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
