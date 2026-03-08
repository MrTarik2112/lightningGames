// Rush Hour - Slide cars to exit
class RushHour {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.gridSize = 60;
        this.offsetX = 140;
        this.offsetY = 90;
        
        this.cars = [];
        this.selectedCar = null;
        this.moves = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.moves = 0;
        
        this.cars = [
            { id: 'player', x: 1, y: 2, w: 2, h: 1, color: '#00d4ff', horizontal: true },
            { id: '1', x: 0, y: 0, w: 1, h: 2, color: '#ff4466', horizontal: false },
            { id: '2', x: 1, y: 0, w: 2, h: 1, color: '#ffcc00', horizontal: true },
            { id: '3', x: 3, y: 0, w: 1, h: 3, color: '#00ff88', horizontal: false },
            { id: '4', x: 4, y: 1, w: 1, h: 2, color: '#ff00aa', horizontal: false },
            { id: '5', x: 0, y: 3, w: 2, h: 1, color: '#8855ff', horizontal: true },
            { id: '6', x: 2, y: 3, w: 1, h: 2, color: '#ff8844', horizontal: false },
            { id: '7', x: 3, y: 3, w: 2, h: 1, color: '#00d4ff', horizontal: true },
            { id: '8', x: 5, y: 3, w: 1, h: 2, color: '#ff4466', horizontal: false },
        ];
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.mousedown = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            
            const gx = Math.floor((mx - this.offsetX) / this.gridSize);
            const gy = Math.floor((my - this.offsetY) / this.gridSize);
            
            for (const car of this.cars) {
                if (car.horizontal) {
                    if (gy === car.y && gx >= car.x && gx < car.x + car.w) {
                        this.selectedCar = car;
                        return;
                    }
                } else {
                    if (gx === car.x && gy >= car.y && gy < car.y + car.h) {
                        this.selectedCar = car;
                        return;
                    }
                }
            }
        };
        
        this._handlers.mousemove = (e) => {
            if (!this.selectedCar || this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            
            const newPos = this.selectedCar.horizontal 
                ? Math.floor((mx - this.offsetX) / this.gridSize)
                : Math.floor((my - this.offsetY) / this.gridSize);
            
            const oldPos = this.selectedCar.horizontal ? this.selectedCar.x : this.selectedCar.y;
            const size = this.selectedCar.horizontal ? this.selectedCar.w : this.selectedCar.h;
            
            if (newPos !== oldPos) {
                let canMove = true;
                const testPos = this.selectedCar.horizontal ? newPos : this.selectedCar.x;
                const testSize = this.selectedCar.horizontal ? this.selectedCar.x : newPos;
                const testSize2 = this.selectedCar.horizontal ? newPos + this.selectedCar.w : this.selectedCar.y + this.selectedCar.h;
                
                if (newPos < 0 || testPos + size > 6) canMove = false;
                
                for (const car of this.cars) {
                    if (car === this.selectedCar) continue;
                    if (this._checkCollision(this.selectedCar, newPos)) {
                        canMove = false;
                        break;
                    }
                }
                
                if (canMove) {
                    if (this.selectedCar.horizontal) this.selectedCar.x = newPos;
                    else this.selectedCar.y = newPos;
                    this.moves++;
                    this.score = 1000 - this.moves;
                    if (window.soundManager) window.soundManager.playClick();
                }
            }
            
            if (this.selectedCar.id === 'player' && this.selectedCar.x === 4) {
                this.gameOver = true;
                this.score = Math.max(0, 1000 - this.moves * 10);
                if (window.soundManager) window.soundManager.playLevelUp();
            }
        };
        
        this._handlers.mouseup = () => {
            this.selectedCar = null;
        };
        
        this.canvas.addEventListener('mousedown', this._handlers.mousedown);
        this.canvas.addEventListener('mousemove', this._handlers.mousemove);
        document.addEventListener('mouseup', this._handlers.mouseup);
    }

    _checkCollision(car, newPos) {
        const testCar = { 
            x: car.horizontal ? newPos : car.x, 
            y: car.horizontal ? car.y : newPos,
            w: car.w, h: car.h 
        };
        
        for (const other of this.cars) {
            if (other === car) continue;
            if (testCar.x < other.x + other.w && testCar.x + testCar.w > other.x &&
                testCar.y < other.y + other.h && testCar.y + testCar.h > other.y) {
                return true;
            }
        }
        return false;
    }

    _unbindEvents() {
        this.canvas.removeEventListener('mousedown', this._handlers.mousedown);
        this.canvas.removeEventListener('mousemove', this._handlers.mousemove);
        document.removeEventListener('mouseup', this._handlers.mouseup);
    }

    update(dt) {}

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 6; i++) {
            ctx.beginPath();
            ctx.moveTo(this.offsetX + i * this.gridSize, this.offsetY);
            ctx.lineTo(this.offsetX + i * this.gridSize, this.offsetY + 6 * this.gridSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.offsetX, this.offsetY + i * this.gridSize);
            ctx.lineTo(this.offsetX + 6 * this.gridSize, this.offsetY + i * this.gridSize);
            ctx.stroke();
        }
        
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.offsetX + 5 * this.gridSize, this.offsetY + 2 * this.gridSize, this.gridSize, this.gridSize);
        
        for (const car of this.cars) {
            const cx = this.offsetX + car.x * this.gridSize + 3;
            const cy = this.offsetY + car.y * this.gridSize + 3;
            const cw = car.w * this.gridSize - 6;
            const ch = car.h * this.gridSize - 6;
            
            ctx.fillStyle = car.color;
            ctx.shadowColor = car.color;
            ctx.shadowBlur = 15;
            
            const radius = 8;
            ctx.beginPath();
            ctx.roundRect(cx, cy, cw, ch, radius);
            ctx.fill();
            
            if (car.id === 'player') {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('→', cx + cw / 2, cy + ch / 2);
            }
        }
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Moves: ' + this.moves, canvas.width / 2, 45);
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 48px Inter';
            ctx.fillText('YOU ESCAPED!', canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.fillText('Moves: ' + this.moves, canvas.width / 2, canvas.height / 2 + 20);
            ctx.font = '18px Inter';
            ctx.fillStyle = '#888';
            ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Drag the blue car to the exit →', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('rushhour', RushHour, {
        name: 'Rush Hour',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
