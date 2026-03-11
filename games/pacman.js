/**
 * PAC-MAN - Classic Arcade Game
 * Optimized version with proper speed, better maze, and smart AI
 */

class PacMan {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.gamePaused = false;
        this.level = 1;
        this.lives = 3;
        
        // Grid settings
        this.gridSize = 20;
        this.cols = 28;
        this.rows = 31;
        
        // Movement speed (smooth interpolation)
        this.moveSpeed = 0.15; // Smooth movement speed
        this.ghostSpeed = 0.12;
        
        // Pac-Man
        this.pacman = {
            x: 14,
            y: 23,
            targetX: 14,
            targetY: 23,
            direction: 0,
            nextDirection: 0,
            mouthOpen: true,
            mouthTimer: 0
        };
        
        // Ghosts with unique behaviors
        this.ghosts = [
            { x: 13, y: 11, targetX: 13, targetY: 11, color: '#ff0055', name: 'Blinky', personality: 'aggressive', scatterTarget: { x: 25, y: 0 } },
            { x: 14, y: 14, targetX: 14, targetY: 14, color: '#ffb8ff', name: 'Pinky', personality: 'ambush', scatterTarget: { x: 2, y: 0 } },
            { x: 12, y: 14, targetX: 12, targetY: 14, color: '#00ffff', name: 'Inky', personality: 'unpredictable', scatterTarget: { x: 27, y: 30 } },
            { x: 16, y: 14, targetX: 16, targetY: 14, color: '#ffb847', name: 'Clyde', personality: 'shy', scatterTarget: { x: 0, y: 30 } }
        ];
        
        // Game state
        this.maze = [];
        this.pellets = [];
        this.powerPellets = [];
        this.powerUpActive = false;
        this.powerUpTimer = 0;
        this.powerUpDuration = 6000;
        this.ghostsEaten = 0;
        this.pelletsRemaining = 0;
        this.modeTimer = 0;
        this.modeChangeInterval = 7000;
        this.scatterMode = false;
        
        // Difficulty
        this.difficulty = 'normal';
        
        // Canvas
        this.canvas = null;
        this.ctx = null;
        
        // Input
        this.keys = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Load difficulty
        if (window.gameManager && window.gameManager.settings) {
            this.difficulty = window.gameManager.settings.difficulty || 'normal';
            this.applyDifficulty();
        }
        
        // Initialize maze
        this.initializeMaze();
        
        // Event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        if (window.soundManager) window.soundManager.playLevelUp();
    }

    applyDifficulty() {
        switch(this.difficulty) {
            case 'easy':
                this.moveDelay = 10;
                this.ghostMoveDelay = 14;
                this.powerUpDuration = 8000;
                break;
            case 'normal':
                this.moveDelay = 8;
                this.ghostMoveDelay = 10;
                this.powerUpDuration = 6000;
                break;
            case 'hard':
                this.moveDelay = 6;
                this.ghostMoveDelay = 8;
                this.powerUpDuration = 4000;
                break;
            case 'extreme':
                this.moveDelay = 4;
                this.ghostMoveDelay = 6;
                this.powerUpDuration = 3000;
                break;
        }
    }

    initializeMaze() {
        this.maze = [];
        this.pellets = [];
        this.powerPellets = [];
        
        // Classic Pac-Man maze (28x31)
        const mazePattern = [
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
        
        // Parse maze
        for (let y = 0; y < mazePattern.length; y++) {
            this.maze[y] = [];
            for (let x = 0; x < mazePattern[y].length; x++) {
                const char = mazePattern[y][x];
                
                if (char === '#') {
                    this.maze[y][x] = 1; // Wall
                } else if (char === '-') {
                    this.maze[y][x] = 2; // Ghost house door
                } else {
                    this.maze[y][x] = 0; // Path
                    
                    // Place pellets
                    if (char === '.') {
                        this.pellets.push({ x, y });
                    }
                    // Place power pellets
                    else if (char === 'o') {
                        this.powerPellets.push({ x, y });
                    }
                }
            }
        }
        
        this.pelletsRemaining = this.pellets.length + this.powerPellets.length;
    }

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.pacman.nextDirection = 3;
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                this.pacman.nextDirection = 1;
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                this.pacman.nextDirection = 2;
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                this.pacman.nextDirection = 0;
                e.preventDefault();
                break;
            case ' ':
                this.gamePaused = !this.gamePaused;
                e.preventDefault();
                break;
        }
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    update(dt) {
        if (this.gameOver || this.gamePaused) return;
        
        // Update mode timer
        this.modeTimer += dt * 1000;
        if (this.modeTimer > this.modeChangeInterval) {
            this.modeTimer = 0;
            this.scatterMode = !this.scatterMode;
        }
        
        // Update power-up
        if (this.powerUpActive) {
            this.powerUpTimer -= dt * 1000;
            if (this.powerUpTimer <= 0) {
                this.powerUpActive = false;
                this.ghostsEaten = 0;
            }
        }
        
        // Move Pac-Man
        this.movePacMan();
        
        // Move ghosts
        this.ghosts.forEach(ghost => this.moveGhost(ghost));
        
        // Check collisions
        this.checkPelletCollisions();
        this.checkGhostCollisions();
        
        // Check win
        if (this.pelletsRemaining === 0) {
            this.levelUp();
        }
        
        // Mouth animation
        this.pacman.mouthTimer += dt;
        if (this.pacman.mouthTimer > 0.15) {
            this.pacman.mouthOpen = !this.pacman.mouthOpen;
            this.pacman.mouthTimer = 0;
        }
    }

    movePacMan() {
        this.pacman.moveCounter++;
        if (this.pacman.moveCounter < this.moveDelay) return;
        this.pacman.moveCounter = 0;
        
        // Try next direction
        const nextX = this.pacman.x + (this.pacman.nextDirection === 0 ? 1 : this.pacman.nextDirection === 2 ? -1 : 0);
        const nextY = this.pacman.y + (this.pacman.nextDirection === 1 ? 1 : this.pacman.nextDirection === 3 ? -1 : 0);
        
        if (this.isWalkable(nextX, nextY)) {
            this.pacman.direction = this.pacman.nextDirection;
        }
        
        // Move in current direction
        const moveX = this.pacman.x + (this.pacman.direction === 0 ? 1 : this.pacman.direction === 2 ? -1 : 0);
        const moveY = this.pacman.y + (this.pacman.direction === 1 ? 1 : this.pacman.direction === 3 ? -1 : 0);
        
        if (this.isWalkable(moveX, moveY)) {
            this.pacman.x = moveX;
            this.pacman.y = moveY;
        }
        
        // Tunnel wrap
        if (this.pacman.x < 0) this.pacman.x = this.cols - 1;
        if (this.pacman.x >= this.cols) this.pacman.x = 0;
    }

    moveGhost(ghost) {
        ghost.moveCounter++;
        const delay = this.powerUpActive ? this.ghostMoveDelay + 4 : this.ghostMoveDelay;
        if (ghost.moveCounter < delay) return;
        ghost.moveCounter = 0;
        
        // Determine target
        let targetX, targetY;
        
        if (this.powerUpActive) {
            // Run away from Pac-Man
            targetX = ghost.x + (ghost.x - this.pacman.x);
            targetY = ghost.y + (ghost.y - this.pacman.y);
        } else if (this.scatterMode) {
            // Go to scatter corner
            targetX = ghost.scatterTarget.x;
            targetY = ghost.scatterTarget.y;
        } else {
            // Chase Pac-Man with unique behavior
            switch(ghost.name) {
                case 'Blinky': // Direct chase
                    targetX = this.pacman.x;
                    targetY = this.pacman.y;
                    break;
                case 'Pinky': // Target 4 tiles ahead
                    targetX = this.pacman.x + (this.pacman.direction === 0 ? 4 : this.pacman.direction === 2 ? -4 : 0);
                    targetY = this.pacman.y + (this.pacman.direction === 1 ? 4 : this.pacman.direction === 3 ? -4 : 0);
                    break;
                case 'Inky': // Ambush
                    const aheadX = this.pacman.x + (this.pacman.direction === 0 ? 2 : this.pacman.direction === 2 ? -2 : 0);
                    const aheadY = this.pacman.y + (this.pacman.direction === 1 ? 2 : this.pacman.direction === 3 ? -2 : 0);
                    targetX = aheadX + (aheadX - this.ghosts[0].x);
                    targetY = aheadY + (aheadY - this.ghosts[0].y);
                    break;
                case 'Clyde': // Chase if far, scatter if close
                    const dist = Math.hypot(ghost.x - this.pacman.x, ghost.y - this.pacman.y);
                    if (dist > 8) {
                        targetX = this.pacman.x;
                        targetY = this.pacman.y;
                    } else {
                        targetX = ghost.scatterTarget.x;
                        targetY = ghost.scatterTarget.y;
                    }
                    break;
            }
        }
        
        // Find best move
        const moves = [
            { x: ghost.x + 1, y: ghost.y, dir: 0 },
            { x: ghost.x - 1, y: ghost.y, dir: 2 },
            { x: ghost.x, y: ghost.y + 1, dir: 1 },
            { x: ghost.x, y: ghost.y - 1, dir: 3 }
        ];
        
        let bestMove = null;
        let bestDist = Infinity;
        
        moves.forEach(move => {
            if (this.isWalkable(move.x, move.y)) {
                const dist = Math.hypot(move.x - targetX, move.y - targetY);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestMove = move;
                }
            }
        });
        
        if (bestMove) {
            ghost.x = bestMove.x;
            ghost.y = bestMove.y;
        }
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return true;
        return this.maze[y] && (this.maze[y][x] === 0 || this.maze[y][x] === 2);
    }

    checkPelletCollisions() {
        // Regular pellets
        for (let i = this.pellets.length - 1; i >= 0; i--) {
            if (this.pellets[i].x === this.pacman.x && this.pellets[i].y === this.pacman.y) {
                this.score += 10;
                this.pellets.splice(i, 1);
                this.pelletsRemaining--;
                if (window.soundManager) window.soundManager.playEat();
            }
        }
        
        // Power pellets
        for (let i = this.powerPellets.length - 1; i >= 0; i--) {
            if (this.powerPellets[i].x === this.pacman.x && this.powerPellets[i].y === this.pacman.y) {
                this.score += 50;
                this.powerPellets.splice(i, 1);
                this.pelletsRemaining--;
                this.activatePowerUp();
                if (window.soundManager) window.soundManager.playPowerUp();
            }
        }
    }

    activatePowerUp() {
        this.powerUpActive = true;
        this.powerUpTimer = this.powerUpDuration;
        this.ghostsEaten = 0;
    }

    checkGhostCollisions() {
        this.ghosts.forEach((ghost) => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                if (this.powerUpActive) {
                    // Eat ghost
                    this.score += 200 * Math.pow(2, this.ghostsEaten);
                    this.ghostsEaten++;
                    ghost.x = 14;
                    ghost.y = 14;
                    if (window.soundManager) window.soundManager.playExplosion();
                } else {
                    // Lose life
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver = true;
                    } else {
                        this.resetPositions();
                    }
                    if (window.soundManager) window.soundManager.playDeath();
                }
            }
        });
    }

    resetPositions() {
        this.pacman.x = 14;
        this.pacman.y = 23;
        this.ghosts[0].x = 13;
        this.ghosts[0].y = 11;
        this.ghosts[1].x = 14;
        this.ghosts[1].y = 14;
        this.ghosts[2].x = 12;
        this.ghosts[2].y = 14;
        this.ghosts[3].x = 16;
        this.ghosts[3].y = 14;
    }

    levelUp() {
        this.level++;
        this.score += 500 * this.level;
        this.initializeMaze();
        this.resetPositions();
        this.applyDifficulty();
        if (window.soundManager) window.soundManager.playLevelUp();
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        this.drawMaze();
        
        // Draw pellets
        this.drawPellets();
        
        // Draw power pellets
        this.drawPowerPellets();
        
        // Draw ghosts
        this.drawGhosts();
        
        // Draw Pac-Man
        this.drawPacMan();
        
        // Draw UI
        this.drawUI();
        
        if (this.gamePaused) this.drawPauseOverlay();
    }

    drawMaze() {
        this.ctx.strokeStyle = '#2121ff';
        this.ctx.lineWidth = 2;
        
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 1) {
                    this.ctx.fillStyle = '#2121ff';
                    this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                } else if (this.maze[y][x] === 2) {
                    this.ctx.fillStyle = '#ff69b4';
                    this.ctx.fillRect(x * this.gridSize, y * this.gridSize + 8, this.gridSize, 4);
                }
            }
        }
    }

    drawPellets() {
        this.ctx.fillStyle = '#ffb897';
        this.pellets.forEach(pellet => {
            this.ctx.beginPath();
            this.ctx.arc(
                pellet.x * this.gridSize + this.gridSize / 2,
                pellet.y * this.gridSize + this.gridSize / 2,
                2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    drawPowerPellets() {
        const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + pulse * 0.3})`;
        this.powerPellets.forEach(pellet => {
            this.ctx.beginPath();
            this.ctx.arc(
                pellet.x * this.gridSize + this.gridSize / 2,
                pellet.y * this.gridSize + this.gridSize / 2,
                5 + pulse * 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    drawPacMan() {
        const x = this.pacman.x * this.gridSize + this.gridSize / 2;
        const y = this.pacman.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        
        const mouthAngle = this.pacman.mouthOpen ? 0.25 : 0.05;
        const startAngle = this.pacman.direction * Math.PI / 2 + mouthAngle;
        const endAngle = this.pacman.direction * Math.PI / 2 - mouthAngle + Math.PI * 2;
        
        this.ctx.arc(x, y, radius, startAngle, endAngle);
        this.ctx.lineTo(x, y);
        this.ctx.fill();
    }

    drawGhosts() {
        this.ghosts.forEach(ghost => {
            const x = ghost.x * this.gridSize + this.gridSize / 2;
            const y = ghost.y * this.gridSize + this.gridSize / 2;
            const size = this.gridSize - 4;
            
            // Body
            if (this.powerUpActive) {
                this.ctx.fillStyle = '#0000ff';
            } else {
                this.ctx.fillStyle = ghost.color;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(x, y - size / 4, size / 2, Math.PI, 0);
            this.ctx.lineTo(x + size / 2, y + size / 4);
            this.ctx.lineTo(x + size / 3, y);
            this.ctx.lineTo(x, y + size / 4);
            this.ctx.lineTo(x - size / 3, y);
            this.ctx.lineTo(x - size / 2, y + size / 4);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Eyes
            if (!this.powerUpActive) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x - 4, y - 6, 3, 5);
                this.ctx.fillRect(x + 1, y - 6, 3, 5);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x - 3, y - 5, 2, 3);
                this.ctx.fillRect(x + 2, y - 5, 2, 3);
            }
        });
    }

    drawUI() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        
        this.ctx.fillText(`Score: ${Math.floor(this.score)}`, 10, this.canvas.height - 10);
        this.ctx.fillText(`Level: ${this.level}`, 150, this.canvas.height - 10);
        this.ctx.fillText(`Lives: ${this.lives}`, 250, this.canvas.height - 10);
        
        if (this.powerUpActive) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillText(`POWER UP! ${Math.ceil(this.powerUpTimer / 1000)}s`, 400, this.canvas.height - 10);
        }
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.textAlign = 'left';
    }

    getScore() {
        return Math.floor(this.score);
    }

    isGameOver() {
        return this.gameOver;
    }

    destroy() {
        document.removeEventListener('keydown', (e) => this.handleKeyDown(e));
        document.removeEventListener('keyup', (e) => this.handleKeyUp(e));
    }
}
