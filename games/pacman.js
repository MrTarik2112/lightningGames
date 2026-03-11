/**
 * PAC-MAN - Basit ve Stabil Versiyon
 * Grid-based hareket, 4 hayalet, pellet toplama
 */

class PacMan {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.level = 1;
        this.lives = 3;
        
        // Grid ayarları
        this.gridSize = 20;
        this.cols = 28;
        this.rows = 31;
        
        // Pac-Man - Sub-pixel hareket
        this.pacman = {
            gridX: 14, gridY: 23,
            x: 14 * 20 + 10, y: 23 * 20 + 10, // Sub-pixel pozisyon
            dir: 0, nextDir: 0,
            mouthOpen: true,
            mouthTimer: 0,
            moving: false,
            targetX: 0, targetY: 0
        };
        
        // Hayaletler - Smooth hareket
        this.ghosts = [
            { gridX: 14, gridY: 11, x: 14 * 20 + 10, y: 11 * 20 + 10, dir: 0, color: '#ff0000', name: 'Blinky', startX: 14, startY: 11, moving: false, targetX: 0, targetY: 0 },
            { gridX: 12, gridY: 14, x: 12 * 20 + 10, y: 14 * 20 + 10, dir: 0, color: '#ffb8ff', name: 'Pinky', startX: 12, startY: 14, moving: false, targetX: 0, targetY: 0 },
            { gridX: 14, gridY: 14, x: 14 * 20 + 10, y: 14 * 20 + 10, dir: 0, color: '#00ffff', name: 'Inky', startX: 14, startY: 14, moving: false, targetX: 0, targetY: 0 },
            { gridX: 16, gridY: 14, x: 16 * 20 + 10, y: 14 * 20 + 10, dir: 0, color: '#ffb847', name: 'Clyde', startX: 16, startY: 14, moving: false, targetX: 0, targetY: 0 }
        ];
        
        this.maze = [];
        this.pellets = [];
        this.powerPellets = [];
        this.powerMode = false;
        this.powerTimer = 0;
        this.moveTimer = 0;
        this.moveDelay = 0.12; // Hareket hızı
        this.smoothness = 0.2; // Interpolation faktörü
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.createMaze();
        
        this.keyHandler = (e) => this.handleKey(e);
        document.addEventListener('keydown', this.keyHandler);
        
        if (window.soundManager) window.soundManager.playLevelUp();
    }

    createMaze() {
        // Basit labirent deseni
        const pattern = [
            '############################',
            '#............##............#',
            '#.####.#####.##.#####.####.#',
            '#o####.#####.##.#####.####o#',
            '#.####.#####.##.#####.####.#',
            '#..........................#',
            '#.####.##.########.##.####.#',
            '#.####.##.########.##.####.#',
            '#......##....##....##......#',
            '######.##### ## #####.######',
            '######.##### ## #####.######',
            '######.##          ##.######',
            '######.## ###--### ##.######',
            '######.## #      # ##.######',
            '      .   #      #   .      ',
            '######.## #      # ##.######',
            '######.## ######## ##.######',
            '######.##          ##.######',
            '######.## ######## ##.######',
            '######.## ######## ##.######',
            '#............##............#',
            '#.####.#####.##.#####.####.#',
            '#.####.#####.##.#####.####.#',
            '#o..##.......  .......##..o#',
            '###.##.##.########.##.##.###',
            '###.##.##.########.##.##.###',
            '#......##....##....##......#',
            '#.##########.##.##########.#',
            '#.##########.##.##########.#',
            '#..........................#',
            '############################'
        ];
        
        this.maze = [];
        this.pellets = [];
        this.powerPellets = [];
        
        for (let y = 0; y < pattern.length; y++) {
            this.maze[y] = [];
            for (let x = 0; x < pattern[y].length; x++) {
                const char = pattern[y][x];
                
                if (char === '#') {
                    this.maze[y][x] = 1; // Duvar
                } else {
                    this.maze[y][x] = 0; // Boş
                    if (char === '.') {
                        this.pellets.push({ x, y });
                    } else if (char === 'o') {
                        this.powerPellets.push({ x, y });
                    }
                }
            }
        }
    }

    handleKey(e) {
        const key = e.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') {
            this.pacman.nextDir = 3;
            e.preventDefault();
        } else if (key === 'arrowdown' || key === 's') {
            this.pacman.nextDir = 1;
            e.preventDefault();
        } else if (key === 'arrowleft' || key === 'a') {
            this.pacman.nextDir = 2;
            e.preventDefault();
        } else if (key === 'arrowright' || key === 'd') {
            this.pacman.nextDir = 0;
            e.preventDefault();
        }
    }

    update(dt) {
        if (this.gameOver) return;
        
        this.moveTimer += dt;
        
        // Ağız animasyonu
        this.pacman.mouthTimer += dt;
        if (this.pacman.mouthTimer > 0.15) {
            this.pacman.mouthOpen = !this.pacman.mouthOpen;
            this.pacman.mouthTimer = 0;
        }
        
        // Power mode timer
        if (this.powerMode) {
            this.powerTimer -= dt;
            if (this.powerTimer <= 0) {
                this.powerMode = false;
            }
        }
        
        // Grid hareket
        if (this.moveTimer >= this.moveDelay) {
            this.moveTimer = 0;
            this.movePacman();
            this.moveGhosts();
            this.checkCollisions();
        }
        
        // Smooth interpolation - Sub-pixel hareket
        this.updateSmoothMovement(dt);
        
        // Seviye tamamlandı mı?
        if (this.pellets.length === 0 && this.powerPellets.length === 0) {
            this.levelUp();
        }
    }

    updateSmoothMovement(dt) {
        const p = this.pacman;
        
        // Pac-Man smooth hareket
        if (p.moving) {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 2) {
                p.x = p.targetX;
                p.y = p.targetY;
                p.moving = false;
            } else {
                const speed = 200 * dt; // pixels per second
                p.x += (dx / dist) * speed;
                p.y += (dy / dist) * speed;
            }
        }
        
        // Hayaletler smooth hareket
        this.ghosts.forEach(ghost => {
            if (ghost.moving) {
                const dx = ghost.targetX - ghost.x;
                const dy = ghost.targetY - ghost.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < 2) {
                    ghost.x = ghost.targetX;
                    ghost.y = ghost.targetY;
                    ghost.moving = false;
                } else {
                    const speed = 150 * dt; // pixels per second
                    ghost.x += (dx / dist) * speed;
                    ghost.y += (dy / dist) * speed;
                }
            }
        });
    }

    movePacman() {
        const p = this.pacman;
        
        // Yön değiştirmeyi dene
        const nextX = p.gridX + (p.nextDir === 0 ? 1 : p.nextDir === 2 ? -1 : 0);
        const nextY = p.gridY + (p.nextDir === 1 ? 1 : p.nextDir === 3 ? -1 : 0);
        
        if (this.canMove(nextX, nextY)) {
            p.dir = p.nextDir;
        }
        
        // Mevcut yönde hareket et
        const newX = p.gridX + (p.dir === 0 ? 1 : p.dir === 2 ? -1 : 0);
        const newY = p.gridY + (p.dir === 1 ? 1 : p.dir === 3 ? -1 : 0);
        
        if (this.canMove(newX, newY)) {
            p.gridX = newX;
            p.gridY = newY;
            
            // Tünel geçişi
            if (p.gridX < 0) p.gridX = this.cols - 1;
            if (p.gridX >= this.cols) p.gridX = 0;
            
            // Smooth hareket hedefi
            p.targetX = p.gridX * this.gridSize + this.gridSize / 2;
            p.targetY = p.gridY * this.gridSize + this.gridSize / 2;
            p.moving = true;
            
            this.collectPellet();
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            // Basit AI: Rastgele yön seç
            const possibleDirs = [];
            
            for (let dir = 0; dir < 4; dir++) {
                const newX = ghost.gridX + (dir === 0 ? 1 : dir === 2 ? -1 : 0);
                const newY = ghost.gridY + (dir === 1 ? 1 : dir === 3 ? -1 : 0);
                
                // Geri dönme
                const oppositeDir = (ghost.dir + 2) % 4;
                if (dir === oppositeDir) continue;
                
                if (this.canMove(newX, newY)) {
                    possibleDirs.push(dir);
                }
            }
            
            if (possibleDirs.length > 0) {
                // Power mode'da Pac-Man'den kaç
                if (this.powerMode) {
                    // En uzak yönü seç
                    let bestDir = possibleDirs[0];
                    let maxDist = -1;
                    
                    possibleDirs.forEach(dir => {
                        const newX = ghost.gridX + (dir === 0 ? 1 : dir === 2 ? -1 : 0);
                        const newY = ghost.gridY + (dir === 1 ? 1 : dir === 3 ? -1 : 0);
                        const dist = Math.abs(newX - this.pacman.gridX) + Math.abs(newY - this.pacman.gridY);
                        
                        if (dist > maxDist) {
                            maxDist = dist;
                            bestDir = dir;
                        }
                    });
                    
                    ghost.dir = bestDir;
                } else {
                    // Pac-Man'e yaklaş
                    let bestDir = possibleDirs[0];
                    let minDist = 999;
                    
                    possibleDirs.forEach(dir => {
                        const newX = ghost.gridX + (dir === 0 ? 1 : dir === 2 ? -1 : 0);
                        const newY = ghost.gridY + (dir === 1 ? 1 : dir === 3 ? -1 : 0);
                        const dist = Math.abs(newX - this.pacman.gridX) + Math.abs(newY - this.pacman.gridY);
                        
                        if (dist < minDist) {
                            minDist = dist;
                            bestDir = dir;
                        }
                    });
                    
                    ghost.dir = bestDir;
                }
            }
            
            // Hareketi uygula
            const newX = ghost.gridX + (ghost.dir === 0 ? 1 : ghost.dir === 2 ? -1 : 0);
            const newY = ghost.gridY + (ghost.dir === 1 ? 1 : ghost.dir === 3 ? -1 : 0);
            
            if (this.canMove(newX, newY)) {
                ghost.gridX = newX;
                ghost.gridY = newY;
                
                // Smooth hareket hedefi
                ghost.targetX = ghost.gridX * this.gridSize + this.gridSize / 2;
                ghost.targetY = ghost.gridY * this.gridSize + this.gridSize / 2;
                ghost.moving = true;
            }
        });
    }

    canMove(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
        if (!this.maze[y] || this.maze[y][x] === undefined) return false;
        return this.maze[y][x] === 0;
    }

    collectPellet() {
        const p = this.pacman;
        
        // Normal pellet - Grid pozisyonunu kontrol et
        for (let i = this.pellets.length - 1; i >= 0; i--) {
            if (this.pellets[i].x === p.gridX && this.pellets[i].y === p.gridY) {
                this.pellets.splice(i, 1);
                this.score += 10;
                if (window.soundManager) window.soundManager.playEat();
                break;
            }
        }
        
        // Power pellet - Grid pozisyonunu kontrol et
        for (let i = this.powerPellets.length - 1; i >= 0; i--) {
            if (this.powerPellets[i].x === p.gridX && this.powerPellets[i].y === p.gridY) {
                this.powerPellets.splice(i, 1);
                this.score += 50;
                this.powerMode = true;
                this.powerTimer = 8;
                if (window.soundManager) window.soundManager.playPowerUp();
                break;
            }
        }
    }

    checkCollisions() {
        this.ghosts.forEach(ghost => {
            if (ghost.gridX === this.pacman.gridX && ghost.gridY === this.pacman.gridY) {
                if (this.powerMode) {
                    // Hayaleti ye
                    this.score += 200;
                    ghost.gridX = ghost.startX;
                    ghost.gridY = ghost.startY;
                    ghost.x = ghost.gridX * this.gridSize + this.gridSize / 2;
                    ghost.y = ghost.gridY * this.gridSize + this.gridSize / 2;
                    ghost.moving = false;
                    if (window.soundManager) window.soundManager.playExplosion();
                } else {
                    // Can kaybı
                    this.lives--;
                    if (this.lives <= 0) {
                        this.endGame();
                    } else {
                        this.resetPositions();
                        if (window.soundManager) window.soundManager.playDeath();
                    }
                }
            }
        });
    }

    resetPositions() {
        this.pacman.gridX = 14;
        this.pacman.gridY = 23;
        this.pacman.x = 14 * this.gridSize + this.gridSize / 2;
        this.pacman.y = 23 * this.gridSize + this.gridSize / 2;
        this.pacman.dir = 0;
        this.pacman.nextDir = 0;
        this.pacman.moving = false;
        
        this.ghosts.forEach(ghost => {
            ghost.gridX = ghost.startX;
            ghost.gridY = ghost.startY;
            ghost.x = ghost.gridX * this.gridSize + this.gridSize / 2;
            ghost.y = ghost.gridY * this.gridSize + this.gridSize / 2;
            ghost.dir = 0;
            ghost.moving = false;
        });
    }

    levelUp() {
        this.level++;
        this.score += 1000;
        this.createMaze();
        this.resetPositions();
        this.moveDelay *= 0.9; // Daha hızlı
        if (window.soundManager) window.soundManager.playLevelUp();
    }

    endGame() {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        if (window.gameManager) {
            window.gameManager.checkAndUpdateHighScore('pacman', this.score);
        }
        this.showGameOver();
    }

    showGameOver() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        let hs = 0;
        if (window.gameManager) hs = window.gameManager.getHighScore('pacman');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over</div>
            <div class="game-over-score">Score: ${this.score}</div>
            <div class="game-over-score">Level: ${this.level}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="pacman-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        
        const btn = overlay.querySelector('#pacman-restart');
        if (btn) {
            btn.addEventListener('click', () => {
                if (window.gameManager) window.gameManager.resetCurrentGame();
            });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        // Arka plan
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Labirent
        ctx.fillStyle = '#2121ff';
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 1) {
                    ctx.fillRect(
                        x * this.gridSize,
                        y * this.gridSize,
                        this.gridSize,
                        this.gridSize
                    );
                }
            }
        }
        
        // Pelletler
        ctx.fillStyle = '#ffb897';
        this.pellets.forEach(p => {
            ctx.beginPath();
            ctx.arc(
                p.x * this.gridSize + this.gridSize / 2,
                p.y * this.gridSize + this.gridSize / 2,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
        // Power pelletler
        const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
        this.powerPellets.forEach(p => {
            ctx.beginPath();
            ctx.arc(
                p.x * this.gridSize + this.gridSize / 2,
                p.y * this.gridSize + this.gridSize / 2,
                4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
        // Pac-Man - Sub-pixel rendering
        const radius = this.gridSize / 2 - 2;
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        
        const mouthAngle = this.pacman.mouthOpen ? 0.3 : 0.05;
        const startAngle = this.pacman.dir * Math.PI / 2 + mouthAngle;
        const endAngle = this.pacman.dir * Math.PI / 2 - mouthAngle + Math.PI * 2;
        
        ctx.arc(this.pacman.x, this.pacman.y, radius, startAngle, endAngle);
        ctx.lineTo(this.pacman.x, this.pacman.y);
        ctx.fill();
        
        // Hayaletler - Sub-pixel rendering
        this.ghosts.forEach(ghost => {
            const size = this.gridSize - 4;
            
            // Renk
            if (this.powerMode) {
                const flash = Math.floor(Date.now() / 200) % 2;
                ctx.fillStyle = flash ? '#0000ff' : '#ffffff';
            } else {
                ctx.fillStyle = ghost.color;
            }
            
            // Gövde
            ctx.beginPath();
            ctx.arc(ghost.x, ghost.y - size / 4, size / 2, Math.PI, 0);
            ctx.lineTo(ghost.x + size / 2, ghost.y + size / 4);
            ctx.lineTo(ghost.x + size / 3, ghost.y);
            ctx.lineTo(ghost.x, ghost.y + size / 4);
            ctx.lineTo(ghost.x - size / 3, ghost.y);
            ctx.lineTo(ghost.x - size / 2, ghost.y + size / 4);
            ctx.closePath();
            ctx.fill();
            
            // Gözler
            if (!this.powerMode) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ghost.x - 4, ghost.y - 6, 3, 5);
                ctx.fillRect(ghost.x + 1, ghost.y - 6, 3, 5);
                ctx.fillStyle = '#000000';
                ctx.fillRect(ghost.x - 3, ghost.y - 5, 2, 3);
                ctx.fillRect(ghost.x + 2, ghost.y - 5, 2, 3);
            }
        });
        
        // UI
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 20);
        ctx.fillText(`Level: ${this.level}`, 150, 20);
        ctx.fillText(`Lives: ${this.lives}`, 280, 20);
        
        if (this.powerMode) {
            ctx.fillStyle = '#00ffff';
            ctx.fillText(`POWER! ${Math.ceil(this.powerTimer)}s`, 400, 20);
        }
    }

    getScore() {
        return this.score;
    }

    isGameOver() {
        return this.gameOver;
    }

    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
    }
}

// Oyunu kaydet
if (window.gameManager) {
    window.gameManager.registerGame('pacman', PacMan, {
        name: 'Pac-Man',
        canvasWidth: 560,
        canvasHeight: 620
    });
}
