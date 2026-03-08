// Cube Fall - Stack falling cubes
class CubeFall {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.stack = [];
        this.currentCube = null;
        this.baseWidth = 200;
        this.baseY = 0;
        
        this.perfectStack = 0;
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.baseWidth = 200;
        this.baseY = canvas.height - 100;
        
        this.stack = [
            { x: canvas.width / 2 - this.baseWidth / 2, y: this.baseY, width: this.baseWidth, height: 30, color: '#00d4ff' }
        ];
        
        this.spawnCube();
        this._bindEvents();
    }

    spawnCube() {
        const lastCube = this.stack[this.stack.length - 1];
        const direction = Math.random() < 0.5 ? -1 : 1;
        
        this.currentCube = {
            x: direction === -1 ? -lastCube.width : this.canvas.width,
            y: lastCube.y - 30,
            width: lastCube.width,
            height: 30,
            speed: direction * (300 + this.stack.length * 15),
            color: ['#ff4466', '#ffcc00', '#00ff88', '#ff00aa', '#8855ff'][this.stack.length % 5]
        };
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            if (this.currentCube) {
                this.placeCube();
            }
        };
        
        this._handlers.keydown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
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

    placeCube() {
        const current = this.currentCube;
        const last = this.stack[this.stack.length - 1];
        
        let overlap;
        
        if (current.speed > 0) {
            overlap = last.x + last.width - current.x;
        } else {
            overlap = current.x + current.width - last.x;
        }
        
        if (overlap <= 0) {
            this.gameOver = true;
            this._unbindEvents();
            if (window.soundManager) window.soundManager.playDeath();
            return;
        }
        
        let newWidth = overlap;
        let newX = current.speed > 0 ? current.x : last.x;
        
        if (overlap < 10) {
            this.perfectStack = 0;
        } else {
            const perfect = Math.abs(overlap - last.width) < 5;
            if (perfect) {
                this.perfectStack++;
                this.score += 20;
                if (window.soundManager) window.soundManager.playLevelUp();
            } else {
                this.perfectStack = 0;
            }
        }
        
        this.stack.push({
            x: newX,
            y: current.y,
            width: newWidth,
            height: current.height,
            color: current.color
        });
        
        this.score += 10;
        if (window.soundManager) window.soundManager.playScore();
        
        if (this.stack.length > 15) {
            const removeCount = this.stack.length - 15;
            this.stack.splice(1, removeCount);
        }
        
        this.spawnCube();
    }

    update(dt) {
        if (this.gameOver) return;
        
        if (this.currentCube) {
            this.currentCube.x += this.currentCube.speed * dt;
            
            const last = this.stack[this.stack.length - 1];
            if ((this.currentCube.speed > 0 && this.currentCube.x > last.x + last.width) ||
                (this.currentCube.speed < 0 && this.currentCube.x + this.currentCube.width < last.x)) {
                
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
        
        const offsetX = canvas.width / 2 - (this.stack[this.stack.length - 1].x + this.stack[this.stack.length - 1].width / 2);
        
        for (let i = 0; i < this.stack.length; i++) {
            const cube = this.stack[i];
            const x = cube.x + offsetX;
            
            ctx.fillStyle = cube.color;
            ctx.shadowColor = cube.color;
            ctx.shadowBlur = 15;
            ctx.fillRect(x, cube.y, cube.width, cube.height);
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, cube.y, cube.width, cube.height);
        }
        
        if (this.currentCube && !this.gameOver) {
            const cube = this.currentCube;
            const x = cube.x + offsetX;
            
            ctx.fillStyle = cube.color;
            ctx.shadowColor = cube.color;
            ctx.shadowBlur = 20;
            ctx.fillRect(x, cube.y, cube.width, cube.height);
            ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 45);
        
        if (this.perfectStack > 1) {
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 20px Inter';
            ctx.fillText('Perfect x' + this.perfectStack + '!', canvas.width / 2, 75);
        }
        
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
            ctx.fillText('Click or Space to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Click or Space to stop the cube', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('cubefall', CubeFall, {
        name: 'Cube Fall',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
