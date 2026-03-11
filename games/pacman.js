/**
 * PAC-MAN - ULTIMATE EDITION
 * Smooth movement, smart AI, particles, fruit, and more!
 */

class PacMan {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.level = 1;
        this.lives = 3;
        this.extraLifeAwarded = false;
        
        // Grid ayarları
        this.gridSize = 20;
        this.cols = 28;
        this.rows = 31;
        
        // Pac-Man - Sub-pixel smooth hareket
        this.pacman = {
            gridX: 14, gridY: 23,
            x: 14 * 20 + 10, y: 23 * 20 + 10,
            dir: 0, nextDir: 0,
            mouthOpen: true,
            mouthTimer: 0,
            mouthSpeed: 0.12,
            moving: false,
            targetX: 0, targetY: 0,
            startX: 14, startY: 23
        };
        
        // Hayaletler - Akıllı AI
        this.ghosts = [
            { 
                gridX: 14, gridY: 11, x: 14 * 20 + 10, y: 11 * 20 + 10, 
                dir: 0, color: '#ff0000', name: 'Blinky', 
                startX: 14, startY: 11, 
                moving: false, targetX: 0, targetY: 0,
                personality: 'hunter', // Her zaman Pac-Man'i takip eder
                speed: 1.0,
                eaten: false,
                eyes: false
            },
            { 
                gridX: 12, gridY: 14, x: 12 * 20 + 10, y: 14 * 20 + 10, 
                dir: 0, color: '#ffb8ff', name: 'Pinky', 
                startX: 12, startY: 14, 
                moving: false, targetX: 0, targetY: 0,
                personality: 'ambusher', // Pac-Man'in önünü keser
                speed: 1.0,
                eaten: false,
                eyes: false
            },
            { 
                gridX: 14, gridY: 14, x: 14 * 20 + 10, y: 14 * 20 + 10, 
                dir: 0, color: '#00ffff', name: 'Inky', 
                startX: 14, startY: 14, 
                moving: false, targetX: 0, targetY: 0,
                personality: 'flanker', // Blinky ile koordineli
                speed: 1.0,
                eaten: false,
                eyes: false
            },
            { 
                gridX: 16, gridY: 14, x: 16 * 20 + 10, y: 14 * 20 + 10, 
                dir: 0, color: '#ffb847', name: 'Clyde', 
                startX: 16, startY: 14, 
                moving: false, targetX: 0, targetY: 0,
                personality: 'random', // Rastgele hareket
                speed: 1.0,
                eaten: false,
                eyes: false
            }
        ];
        
        this.maze = [];
        this.pellets = [];
        this.powerPellets = [];
        this.powerMode = false;
        this.powerTimer = 0;
        this.powerFlash = false;
        this.moveTimer = 0;
        this.moveDelay = 0.12;
        this.ghostSpeed = 0.12;
        this.frightenedTimer = 0;
        this.frightenedDuration = 6;
        
        // Fruit sistemi
        this.fruit = null;
        this.fruitTimer = 0;
        this.fruitSpawnTime = 12; // Saniye
        this.fruitEaten = false;
        this.fruitPoints = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
        
        // Partiküller
        this.particles = [];
        
        // Ses durumu
        this.sirenPhase = 0;
        this.sirenTimer = 0;
        
        // Oyun durumu
        this.spawning = true;
        this.spawnTimer = 0;
        this.introMode = true;
        this.introTimer = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.createMaze();
        
        this.keyHandler = (e) => this.handleKey(e);
        document.addEventListener('keydown', this.keyHandler);
        
        // İntro animasyonu
        this.introTimer = 0;
        
        if (window.soundManager) {
            window.soundManager.playLevelUp();
        }
    }

    createMaze() {
        // Klasik Pac-Man labirenti
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
                    this.maze[y][x] = 1;
                } else {
                    this.maze[y][x] = 0;
                    if (char === '.') {
                        this.pellets.push({ x, y, active: true });
                    } else if (char === 'o') {
                        this.powerPellets.push({ x, y, active: true });
                    }
                }
            }
        }
    }

    handleKey(e) {
        if (this.introMode) {
            this.introMode = false;
            this.spawning = false;
        }
        
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
        
        // İntro modu
        if (this.introMode) {
            this.introTimer += dt;
            if (this.introTimer > 2) {
                this.introMode = false;
            }
            return;
        }
        
        this.moveTimer += dt;
        
        // Ağız animasyonu
        this.pacman.mouthTimer += dt;
        if (this.pacman.mouthTimer > this.pacman.mouthSpeed) {
            this.pacman.mouthOpen = !this.pacman.mouthOpen;
            this.pacman.mouthTimer = 0;
        }
        
        // Power mode
        if (this.powerMode) {
            this.powerTimer -= dt;
            this.powerFlash = this.powerTimer < 2 && Math.floor(this.powerTimer * 4) % 2 === 0;
            
            if (this.powerTimer <= 0) {
                this.powerMode = false;
                this.ghosts.forEach(g => {
                    if (g.eaten) {
                        g.eaten = false;
                        g.eyes = false;
                    }
                });
            }
        }
        
        // Fruit spawn
        if (!this.fruit && !this.fruitEaten && this.pellets.filter(p => p.active).length <= 70) {
            this.fruitTimer += dt;
            if (this.fruitTimer > this.fruitSpawnTime) {
                this.fruitTimer = 0;
                this.spawnFruit();
            }
        }
        
        // Fruit süre limiti
        if (this.fruit) {
            this.fruit.life -= dt;
            if (this.fruit.life <= 0) {
                this.fruit = null;
            }
        }
        
        // Grid hareket
        if (this.moveTimer >= this.moveDelay) {
            this.moveTimer = 0;
            this.movePacman();
            this.moveGhosts();
            this.checkCollisions();
        }
        
        // Smooth hareket
        this.updateSmoothMovement(dt);
        
        // Partiküller
        this.updateParticles(dt);
        
        // Seviye tamamlandı
        if (this.pellets.filter(p => p.active).length === 0 && this.powerPellets.filter(p => p.active).length === 0) {
            this.levelUp();
        }
    }

    updateSmoothMovement(dt) {
        const p = this.pacman;
        
        if (p.moving) {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 2) {
                p.x = p.targetX;
                p.y = p.targetY;
                p.moving = false;
            } else {
                const speed = 200 * dt;
                p.x += (dx / dist) * speed;
                p.y += (dy / dist) * speed;
            }
        }
        
        this.ghosts.forEach(ghost => {
            if (ghost.moving && !ghost.eyes) {
                const dx = ghost.targetX - ghost.x;
                const dy = ghost.targetY - ghost.y;
                const dist = Math.hypot(dx, dy);
                
                const speed = ghost.eaten ? 300 : (this.powerMode ? 80 : 150) * dt;
                
                if (dist < 2) {
                    ghost.x = ghost.targetX;
                    ghost.y = ghost.targetY;
                    ghost.moving = false;
                } else {
                    ghost.x += (dx / dist) * speed;
                    ghost.y += (dy / dist) * speed;
                }
            } else if (ghost.eyes) {
                // Gözler hızlı geri döner
                const dx = ghost.startX * this.gridSize + this.gridSize / 2 - ghost.x;
                const dy = ghost.startY * this.gridSize + this.gridSize / 2 - ghost.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < 5) {
                    ghost.eyes = false;
                    ghost.eaten = false;
                    ghost.x = ghost.startX * this.gridSize + this.gridSize / 2;
                    ghost.y = ghost.startY * this.gridSize + this.gridSize / 2;
                } else {
                    const speed = 400 * dt;
                    ghost.x += (dx / dist) * speed;
                    ghost.y += (dy / dist) * speed;
                }
            }
        });
    }

    movePacman() {
        const p = this.pacman;
        
        // Yön değiştirme
        const nextX = p.gridX + (p.nextDir === 0 ? 1 : p.nextDir === 2 ? -1 : 0);
        const nextY = p.gridY + (p.nextDir === 1 ? 1 : p.nextDir === 3 ? -1 : 0);
        
        if (this.canMove(nextX, nextY)) {
            p.dir = p.nextDir;
        }
        
        // Hareket
        const newX = p.gridX + (p.dir === 0 ? 1 : p.dir === 2 ? -1 : 0);
        const newY = p.gridY + (p.dir === 1 ? 1 : p.dir === 3 ? -1 : 0);
        
        if (this.canMove(newX, newY)) {
            p.gridX = newX;
            p.gridY = newY;
            
            // Tünel
            if (p.gridX < 0) p.gridX = this.cols - 1;
            if (p.gridX >= this.cols) p.gridX = 0;
            
            p.targetX = p.gridX * this.gridSize + this.gridSize / 2;
            p.targetY = p.gridY * this.gridSize + this.gridSize / 2;
            p.moving = true;
            
            this.collectPellet();
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            if (ghost.eyes) return; // Gözler otomatik dönüyor
            
            const possibleDirs = [];
            
            for (let dir = 0; dir < 4; dir++) {
                const newX = ghost.gridX + (dir === 0 ? 1 : dir === 2 ? -1 : 0);
                const newY = ghost.gridY + (dir === 1 ? 1 : dir === 3 ? -1 : 0);
                
                const oppositeDir = (ghost.dir + 2) % 4;
                if (dir === oppositeDir && !ghost.eaten) continue;
                
                if (this.canMove(newX, newY)) {
                    possibleDirs.push(dir);
                }
            }
            
            if (possibleDirs.length > 0) {
                let targetX, targetY;
                
                if (ghost.eaten) {
                    // Eve dön
                    targetX = ghost.startX;
                    targetY = ghost.startY;
                } else if (this.powerMode) {
                    // Kaç
                    targetX = ghost.startX;
                    targetY = ghost.startY;
                } else {
                    // Pac-Man'e yaklaş
                    switch(ghost.personality) {
                        case 'hunter':
                            targetX = this.pacman.gridX;
                            targetY = this.pacman.gridY;
                            break;
                        case 'ambusher':
                            targetX = this.pacman.gridX + (this.pacman.dir === 0 ? 4 : this.pacman.dir === 2 ? -4 : 0);
                            targetY = this.pacman.gridY + (this.pacman.dir === 1 ? 4 : this.pacman.dir === 3 ? -4 : 0);
                            break;
                        case 'flanker':
                            const blinky = this.ghosts[0];
                            targetX = this.pacman.gridX + (this.pacman.gridX - blinky.gridX);
                            targetY = this.pacman.gridY + (this.pacman.gridY - blinky.gridY);
                            break;
                        default:
                            targetX = this.pacman.gridX;
                            targetY = this.pacman.gridY;
                    }
                }
                
                let bestDir = possibleDirs[0];
                let bestDist = ghost.eaten ? Infinity : 999;
                
                possibleDirs.forEach(dir => {
                    const newX = ghost.gridX + (dir === 0 ? 1 : dir === 2 ? -1 : 0);
                    const newY = ghost.gridY + (dir === 1 ? 1 : dir === 3 ? -1 : 0);
                    const dist = Math.abs(newX - targetX) + Math.abs(newY - targetY);
                    
                    if (ghost.eaten) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestDir = dir;
                        }
                    } else if (this.powerMode) {
                        if (dist > bestDist) {
                            bestDist = dist;
                            bestDir = dir;
                        }
                    } else {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestDir = dir;
                        }
                    }
                });
                
                ghost.dir = bestDir;
            }
            
            const newX = ghost.gridX + (ghost.dir === 0 ? 1 : ghost.dir === 2 ? -1 : 0);
            const newY = ghost.gridY + (ghost.dir === 1 ? 1 : ghost.dir === 3 ? -1 : 0);
            
            if (this.canMove(newX, newY)) {
                ghost.gridX = newX;
                ghost.gridY = newY;
                
                ghost.targetX = ghost.gridX * this.gridSize + this.gridSize / 2;
                ghost.targetY = ghost.gridY * this.gridSize + this.gridSize / 2;
                ghost.moving = true;
            }
        });
    }

    canMove(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return true; // Tünel
        if (!this.maze[y] || this.maze[y][x] === undefined) return false;
        return this.maze[y][x] === 0;
    }

    collectPellet() {
        const p = this.pacman;
        
        // Normal pellet
        this.pellets.forEach(pellet => {
            if (pellet.active && pellet.x === p.gridX && pellet.y === p.gridY) {
                pellet.active = false;
                this.score += 10;
                this.spawnParticles(p.x, p.y, '#ffb897', 5);
                if (window.soundManager) window.soundManager.playEat();
            }
        });
        
        // Power pellet
        this.powerPellets.forEach(pellet => {
            if (pellet.active && pellet.x === p.gridX && pellet.y === p.gridY) {
                pellet.active = false;
                this.score += 50;
                this.powerMode = true;
                this.powerTimer = 8;
                this.ghosts.forEach(g => {
                    if (!g.eaten) {
                        g.dir = (g.dir + 2) % 4; // Yön değiştir
                    }
                });
                this.spawnParticles(p.x, p.y, '#ffffff', 20);
                if (window.soundManager) window.soundManager.playPowerUp();
            }
        });
        
        // Fruit
        if (this.fruit && this.fruit.x === p.gridX && this.fruit.y === p.gridY) {
            const points = this.fruitPoints[Math.min(this.level - 1, 9)];
            this.score += points;
            this.spawnParticles(this.fruit.x * this.gridSize + 10, this.fruit.y * this.gridSize + 10, '#ff6b6b', 15);
            if (window.soundManager) window.soundManager.playEat();
            this.fruit = null;
            this.fruitEaten = true;
        }
    }

    spawnFruit() {
        // Fruit pozisyonları
        const positions = [
            { x: 13, y: 17 },
            { x: 14, y: 17 }
        ];
        const pos = positions[Math.floor(Math.random() * positions.length)];
        
        this.fruit = {
            x: pos.x,
            y: pos.y,
            type: Math.min(this.level - 1, 9),
            life: 9
        };
    }

    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 150,
                vy: (Math.random() - 0.5) * 150,
                life: 1,
                color
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 2;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        this.ghosts.forEach(ghost => {
            if (ghost.gridX === this.pacman.gridX && ghost.gridY === this.pacman.gridY) {
                if (ghost.eyes) return;
                
                if (this.powerMode && !ghost.eaten) {
                    // Hayaleti ye
                    ghost.eaten = true;
                    ghost.eyes = true;
                    this.score += 200 * (this.ghosts.filter(g => g.eaten).length);
                    this.spawnParticles(ghost.x, ghost.y, ghost.color, 15);
                    if (window.soundManager) window.soundManager.playExplosion();
                } else if (!ghost.eaten) {
                    // Can kaybı
                    this.lives--;
                    if (this.lives <= 0) {
                        this.endGame();
                    } else {
                        this.resetPositions();
                        this.spawnParticles(this.pacman.x, this.pacman.y, '#ffff00', 30);
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
        
        this.ghosts.forEach((ghost, i) => {
            ghost.gridX = ghost.startX;
            ghost.gridY = ghost.startY;
            ghost.x = ghost.gridX * this.gridSize + this.gridSize / 2;
            ghost.y = ghost.gridY * this.gridSize + this.gridSize / 2;
            ghost.dir = i === 0 ? 2 : 0;
            ghost.moving = false;
            ghost.eaten = false;
            ghost.eyes = false;
        });
        
        this.powerMode = false;
        this.fruit = null;
        this.fruitTimer = 0;
    }

    levelUp() {
        this.level++;
        this.score += 2000;
        this.moveDelay *= 0.95;
        this.createMaze();
        this.resetPositions();
        this.fruitEaten = false;
        this.fruitTimer = 0;
        
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
                    ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }
        
        // Pelletler
        ctx.fillStyle = '#ffb897';
        this.pellets.forEach(p => {
            if (p.active) {
                ctx.beginPath();
                ctx.arc(p.x * this.gridSize + 10, p.y * this.gridSize + 10, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Power pelletler
        const pulse = Math.sin(Date.now() / 150) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
        this.powerPellets.forEach(p => {
            if (p.active) {
                ctx.beginPath();
                ctx.arc(p.x * this.gridSize + 10, p.y * this.gridSize + 10, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Fruit
        if (this.fruit) {
            const fruitColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5253'];
            const fruitIcons = ['🍒', '🍓', '🍊', '🍋', '🍅', '🍆', '🥥', '🍑', '🍐', '🍎'];
            
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fruitIcons[this.fruit.type], this.fruit.x * 20 + 10, this.fruit.y * 20 + 10);
        }
        
        // Partiküller
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Pac-Man
        const radius = this.gridSize / 2 - 2;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        
        const mouthAngle = this.pacman.mouthOpen ? 0.3 : 0.05;
        const startAngle = this.pacman.dir * Math.PI / 2 + mouthAngle;
        const endAngle = this.pacman.dir * Math.PI / 2 - mouthAngle + Math.PI * 2;
        
        ctx.arc(this.pacman.x, this.pacman.y, radius, startAngle, endAngle);
        ctx.lineTo(this.pacman.x, this.pacman.y);
        ctx.fill();
        
        // Hayaletler
        this.ghosts.forEach(ghost => {
            const size = this.gridSize - 4;
            
            if (ghost.eyes) {
                // Sadece gözler
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ghost.x - 4, ghost.y - 2, 4, 0, Math.PI * 2);
                ctx.arc(ghost.x + 4, ghost.y - 2, 4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#0000ff';
                ctx.beginPath();
                ctx.arc(ghost.x - 4, ghost.y - 2, 2, 0, Math.PI * 2);
                ctx.arc(ghost.x + 4, ghost.y - 2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.powerMode && !ghost.eaten) {
                // Frightened modu
                const flash = Math.floor(Date.now() / 200) % 2;
                ctx.fillStyle = flash ? '#0000ff' : '#ffffff';
                
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
                
                // Korkmuş yüz
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(ghost.x - 4, ghost.y - 4, 2, 0, Math.PI * 2);
                ctx.arc(ghost.x + 4, ghost.y - 4, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(ghost.x, ghost.y + 2, 3, 0, Math.PI);
                ctx.stroke();
            } else {
                // Normal hayalet
                ctx.fillStyle = ghost.color;
                
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
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ghost.x - 4, ghost.y - 6, 4, 0, Math.PI * 2);
                ctx.arc(ghost.x + 4, ghost.y - 6, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Göz bebekleri
                const eyeOffsetX = (ghost.dir === 0 ? 2 : ghost.dir === 2 ? -2 : 0);
                const eyeOffsetY = (ghost.dir === 1 ? 2 : ghost.dir === 3 ? -2 : 0);
                ctx.fillStyle = '#0000ff';
                ctx.beginPath();
                ctx.arc(ghost.x - 4 + eyeOffsetX, ghost.y - 6 + eyeOffsetY, 2, 0, Math.PI * 2);
                ctx.arc(ghost.x + 4 + eyeOffsetX, ghost.y - 6 + eyeOffsetY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // UI
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 20);
        ctx.fillText(`Level: ${this.level}`, 150, 20);
        
        // Canlar
        for (let i = 0; i < this.lives; i++) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(280 + i * 25, 15, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Power mode göstergesi
        if (this.powerMode) {
            ctx.fillStyle = this.powerFlash ? '#ff0000' : '#00ffff';
            ctx.fillText(`POWER! ${Math.ceil(this.powerTimer)}s`, 400, 20);
        }
        
        // Pellet sayısı
        const pelletsLeft = this.pellets.filter(p => p.active).length + this.powerPellets.filter(p => p.active).length;
        ctx.fillStyle = '#888888';
        ctx.fillText(`Remaining: ${pelletsLeft}`, 520, 20);
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