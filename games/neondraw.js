// Neon Draw v3.0 - Simple & Fast Drawing
class NeonDraw {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastPos = null;
        
        // Drawing layers
        this.strokes = [];
        
        // Colors
        this.colors = ['#00d4ff', '#ff00aa', '#00ff88', '#ffcc00', '#ff6b35', '#8855ff', '#ff4466', '#55aaff', '#ffffff'];
        this.currentColorIndex = 0;
        
        // Settings
        this.brushSize = 8;
        this.brushType = 'neon';
        this.showGrid = true;
        
        // Handlers
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.strokes = [];
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();

        this._handlers.mousedown = (e) => {
            this.isDrawing = true;
            this.lastPos = this._getPos(e);
            this.strokes.push({
                points: [this.lastPos],
                color: this.colors[this.currentColorIndex],
                size: this.brushSize,
                type: this.brushType
            });
        };

        this._handlers.mousemove = (e) => {
            if (!this.isDrawing) return;
            const pos = this._getPos(e);
            const stroke = this.strokes[this.strokes.length - 1];
            if (stroke) {
                stroke.points.push(pos);
            }
            this.lastPos = pos;
        };

        this._handlers.mouseup = () => {
            this.isDrawing = false;
        };

        this._handlers.keydown = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'c') {
                this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
            } else if (key === '[') {
                this.brushSize = Math.max(2, this.brushSize - 2);
            } else if (key === ']') {
                this.brushSize = Math.min(40, this.brushSize + 2);
            } else if (key === 'g') {
                this.showGrid = !this.showGrid;
            } else if (key === 'b') {
                this.brushType = this.brushType === 'neon' ? 'glow' : 
                               this.brushType === 'glow' ? 'rainbow' : 'neon';
            } else if (key === 'escape') {
                this.strokes = [];
            }
        };

        this.canvas.addEventListener('mousedown', this._handlers.mousedown);
        this.canvas.addEventListener('mousemove', this._handlers.mousemove);
        this.canvas.addEventListener('mouseup', this._handlers.mouseup);
        this.canvas.addEventListener('mouseleave', this._handlers.mouseup);
        
        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this._handlers.mousedown(t);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this._handlers.mousemove(t);
        }, { passive: false });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this._handlers.mouseup();
        }, { passive: false });
        
        document.addEventListener('keydown', this._handlers.keydown);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('mousedown', this._handlers.mousedown);
        this.canvas.removeEventListener('mousemove', this._handlers.mousemove);
        this.canvas.removeEventListener('mouseup', this._handlers.mouseup);
        this.canvas.removeEventListener('mouseleave', this._handlers.mouseup);
        this.canvas.removeEventListener('touchstart', this._handlers.mousedown);
        this.canvas.removeEventListener('touchmove', this._handlers.mousemove);
        this.canvas.removeEventListener('touchend', this._handlers.mouseup);
        document.removeEventListener('keydown', this._handlers.keydown);
    }

    _getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    update(dt) {}

    draw() {
        const { ctx, canvas } = this;
        
        // Background
        ctx.fillStyle = '#080810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        if (this.showGrid) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }
        }

        // Draw all strokes
        for (const stroke of this.strokes) {
            if (stroke.points.length < 2) continue;
            
            const pts = stroke.points;
            
            if (stroke.type === 'rainbow') {
                // Rainbow gradient
                for (let i = 1; i < pts.length; i++) {
                    const hue = (i * 3) % 360;
                    ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
                    ctx.lineWidth = stroke.size;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(pts[i-1].x, pts[i-1].y);
                    ctx.lineTo(pts[i].x, pts[i].y);
                    ctx.stroke();
                }
            } else if (stroke.type === 'glow') {
                // Glow effect
                for (let layer = 3; layer >= 0; layer--) {
                    ctx.shadowBlur = layer * 8;
                    ctx.shadowColor = stroke.color;
                    ctx.strokeStyle = stroke.color;
                    ctx.lineWidth = stroke.size + layer * 4;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) {
                        ctx.lineTo(pts[i].x, pts[i].y);
                    }
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
            } else {
                // Neon default
                // Glow layer
                ctx.shadowBlur = 15;
                ctx.shadowColor = stroke.color;
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.size;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x, pts[i].y);
                }
                ctx.stroke();
                
                // Core white line
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = stroke.size * 0.4;
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x, pts[i].y);
                }
                ctx.stroke();
            }
        }

        // UI
        this._drawUI();
    }

    _drawUI() {
        const ctx = this.ctx;
        const color = this.colors[this.currentColorIndex];
        
        // Top bar
        ctx.fillStyle = 'rgba(10,10,20,0.85)';
        ctx.fillRect(0, 0, this.canvas.width, 55);
        
        // Colors
        for (let i = 0; i < this.colors.length; i++) {
            const x = 15 + i * 28;
            ctx.fillStyle = this.colors[i];
            if (i === this.currentColorIndex) {
                ctx.shadowColor = this.colors[i];
                ctx.shadowBlur = 12;
            }
            ctx.fillRect(x, 15, 22, 22);
            ctx.shadowBlur = 0;
        }
        
        // Brush size
        ctx.fillStyle = '#888';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Size: ${this.brushSize}`, 270, 32);
        
        // Brush type
        ctx.fillStyle = color;
        ctx.fillText(`[B] ${this.brushType}`, 360, 32);
        
        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillText('NEON DRAW', this.canvas.width/2, 32);
        ctx.shadowBlur = 0;
        
        // Bottom
        ctx.fillStyle = 'rgba(10,10,20,0.6)';
        ctx.fillRect(0, this.canvas.height-30, this.canvas.width, 30);
        ctx.fillStyle = '#555';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('[C] Color  [B] Brush  [ ] Size  [G] Grid  [ESC] Clear', 15, this.canvas.height-10);
        
        ctx.textAlign = 'right';
        ctx.fillText(`Strokes: ${this.strokes.length}`, this.canvas.width-15, this.canvas.height-10);
        
        // Cursor preview
        if (this.lastPos && !this.isDrawing) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(this.lastPos.x, this.lastPos.y, this.brushSize/2, 0, Math.PI*2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    getScore() { return 0; }
    isGameOver() { return false; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('neondraw', NeonDraw, {
        name: 'Neon Draw',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
