// Reaction - Test your reaction time
class Reaction {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.state = 'waiting';
        this.waitTime = 0;
        this.targetTime = 0;
        this.reactionTime = 0;
        this.startTime = 0;
        
        this.target = { x: 0, y: 0, radius: 0, visible: false };
        this.bestTime = Infinity;
        this.times = [];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.state = 'waiting';
        this.waitTime = 0;
        this.targetTime = 2 + Math.random() * 3;
        this.reactionTime = 0;
        
        this.target = { 
            x: 200 + Math.random() * (canvas.width - 400),
            y: 100 + Math.random() * (canvas.height - 200),
            radius: 35,
            visible: false 
        };
        
        this.bestTime = Infinity;
        this.times = [];
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = (e) => {
            if (this.state === 'waiting') {
                if (window.soundManager) window.soundManager.playHit();
            } else if (this.state === 'ready') {
                this.reactionTime = (performance.now() - this.startTime) / 1000;
                this.times.push(this.reactionTime);
                this.score = Math.round(1000 / this.reactionTime);
                if (this.reactionTime < this.bestTime) this.bestTime = this.reactionTime;
                
                if (window.soundManager) window.soundManager.playScore();
                
                this.state = 'cooldown';
                this.waitTime = 0;
            }
        };
        
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('click', this._handlers.click);
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.waitTime += dt;
        
        if (this.state === 'waiting' && this.waitTime >= this.targetTime) {
            this.state = 'ready';
            this.target.visible = true;
            this.startTime = performance.now();
            this.target.x = 200 + Math.random() * (this.canvas.width - 400);
            this.target.y = 100 + Math.random() * (this.canvas.height - 200);
            if (window.soundManager) window.soundManager.playJump();
        }
        
        if (this.state === 'cooldown' && this.waitTime >= 1) {
            this.state = 'waiting';
            this.targetTime = 1 + Math.random() * 2;
            this.waitTime = 0;
            this.target.visible = false;
        }
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
        
        if (this.state === 'ready' && this.target.visible) {
            const pulse = Math.sin(performance.now() / 100) * 5;
            
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 30 + pulse;
            ctx.beginPath();
            ctx.arc(this.target.x, this.target.y, this.target.radius + pulse, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 36px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('TAP!', this.target.x, this.target.y);
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Inter';
        ctx.textAlign = 'center';
        
        if (this.state === 'waiting') {
            ctx.fillStyle = '#ffcc00';
            ctx.fillText('Wait for green...', canvas.width / 2, canvas.height / 2);
        } else if (this.state === 'cooldown') {
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('Last: ' + this.reactionTime.toFixed(3) + 's', canvas.width / 2, canvas.height / 2);
        }
        
        ctx.fillStyle = '#888';
        ctx.font = '16px Inter';
        ctx.fillText('Avg: ' + (this.times.length ? (this.times.reduce((a,b)=>a+b,0)/this.times.length).toFixed(3) : '-') + 's  |  Best: ' + (this.bestTime < Infinity ? this.bestTime.toFixed(3) : '-') + 's', canvas.width / 2, 45);
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 70);
        
        ctx.fillStyle = '#555';
        ctx.font = '14px Inter';
        ctx.fillText('Click when the circle appears', canvas.width / 2, canvas.height - 25);
    }

    getScore() { return this.score; }
    isGameOver() { return false; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('reaction', Reaction, {
        name: 'Reaction',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
