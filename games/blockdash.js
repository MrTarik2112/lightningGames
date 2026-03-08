// Block Dash - Dodge falling blocks
class BlockDash {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 0, y: 0, width: 30, height: 30 };
        this.blocks = [];
        this.speed = 200;
        this.spawnTimer = 0;
        
        this.lanes = 5;
        this.laneWidth = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.laneWidth = canvas.width / this.lanes;
        this.player = { 
            x: Math.floor(this.lanes / 2) * this.laneWidth + this.laneWidth / 2 - 15,
            y: canvas.height - 80,
            width: 30,
            height: 30
        };
        
        this.blocks = [];
        this.speed = 200;
        this.spawnTimer = 0;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const currentLane = Math.floor(this.player.x / this.laneWidth);
            let newLane = currentLane;
            
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') newLane--;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') newLane++;
            
            newLane = Math.max(0, Math.min(this.lanes - 1, newLane));
            
            if (newLane !== currentLane) {
                this.player.x = newLane * this.laneWidth + this.laneWidth / 2 - this.player.width / 2;
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
            
            const currentLane = Math.floor(this.player.x / this.laneWidth);
            const clickLane = Math.floor(mx / this.laneWidth);
            
            if (clickLane !== currentLane) {
                this.player.x = clickLane * this.laneWidth + this.laneWidth / 2 - this.player.width / 2;
                if (window.soundManager) window.soundManager.playClick();
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
        
        this.spawnTimer += dt;
        const spawnInterval = Math.max(0.4, 1.2 - this.speed / 1000);
        
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer = 0;
            const lane = Math.floor(Math.random() * this.lanes);
            const numBlocks = Math.random() < 0.3 ? 2 : 1;
            
            for (let i = 0; i < numBlocks; i++) {
                const blockLane = (lane + i) % this.lanes;
                this.blocks.push({
                    x: blockLane * this.laneWidth + 5,
                    y: -50,
                    width: this.laneWidth - 10,
                    height: 40,
                    lane: blockLane
                });
            }
            
            this.speed += 5;
        }
        
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            block.y += this.speed * dt;
            
            if (this.player.x < block.x + block.width &&
                this.player.x + this.player.width > block.x &&
                this.player.y < block.y + block.height &&
                this.player.y + this.player.height > block.y) {
                
                this.gameOver = true;
                this._unbindEvents();
                if (window.soundManager) window.soundManager.playDeath();
            }
            
            if (block.y > this.canvas.height) {
                this.blocks.splice(i, 1);
                this.score += 10;
                if (window.soundManager) window.soundManager.playScore();
            }
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        for (let i = 1; i < this.lanes; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.laneWidth, 0);
            ctx.lineTo(i * this.laneWidth, canvas.height);
            ctx.stroke();
        }
        
        for (const block of this.blocks) {
            const gradient = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
            gradient.addColorStop(0, '#ff4466');
            gradient.addColorStop(1, '#ff00aa');
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = '#ff4466';
            ctx.shadowBlur = 15;
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillRect(this.player.x + 5, this.player.y + 5, 8, 8);
        ctx.fillRect(this.player.x + 17, this.player.y + 5, 8, 8);
        ctx.fillRect(this.player.x + 5, this.player.y + 17, 20, 4);
        
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
            ctx.fillText('Click or Arrow Keys to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Click lanes or use Arrow Keys to dodge', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('blockdash', BlockDash, {
        name: 'Block Dash',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
