// ═══════════════════════════════════════════════════════════════════════════════
// GARDEN EMPIRE - Idle / Tycoon / Plant Growing Simulation
// Grow plants, harvest, sell, and build your garden empire!
// ═══════════════════════════════════════════════════════════════════════════════

class GardenEmpire {
    constructor() {
        this.canvas = null;
        this.ctx = null;

        // Game state
        this.score = 0;           // Total lifetime earnings (= high score)
        this.money = 100;         // Current balance
        this.gameOver = false;

        // Garden grid
        this.GRID_SIZE = 6;
        this.CELL_SIZE = 64;
        this.GRID_PADDING = 4;
        this.grid = [];           // 2D array of plant objects or null

        // Layout offsets (calculated in init)
        this.gardenOffsetX = 0;
        this.gardenOffsetY = 0;
        this.shopX = 0;
        this.shopWidth = 160;

        // Plant definitions
        this.PLANTS = {
            rose:      { name: 'Gül',       cost: 10,  growTime: 15,  sell: 15,  color: '#ff4466', accent: '#ff8899', bloomColor: '#ff2244', icon: '🌹', unlock: 0 },
            tulip:     { name: 'Lale',      cost: 20,  growTime: 25,  sell: 30,  color: '#ff8800', accent: '#ffaa44', bloomColor: '#ff6600', icon: '🌷', unlock: 0 },
            sunflower: { name: 'Ayçiçeği',  cost: 35,  growTime: 40,  sell: 52,  color: '#ffdd00', accent: '#ffee66', bloomColor: '#eebb00', icon: '🌻', unlock: 0 },
            orchid:    { name: 'Orkide',    cost: 60,  growTime: 60,  sell: 90,  color: '#cc44ff', accent: '#dd88ff', bloomColor: '#aa22dd', icon: '🪻', unlock: 200 },
            smile:     { name: 'Papatya',   cost: 90,  growTime: 90,  sell: 135, color: '#ffffff', accent: '#ffffcc', bloomColor: '#ffff88', icon: '🌼', unlock: 500 },
            cactus:    { name: 'Kaktüs',    cost: 120, growTime: 45,  sell: 180, color: '#22cc44', accent: '#66ee88', bloomColor: '#11aa33', icon: '🌵', unlock: 1000 },
            bonsai:    { name: 'Bonsai',    cost: 200, growTime: 120, sell: 320, color: '#228844', accent: '#44aa66', bloomColor: '#116633', icon: '🌳', unlock: 2000 },
            crystal:   { name: 'Kristal',   cost: 350, growTime: 150, sell: 560, color: '#00ddff', accent: '#88eeff', bloomColor: '#00aadd', icon: '💎', unlock: 5000 },
        };
        this.PLANT_KEYS = Object.keys(this.PLANTS);
        this.selectedSeed = null;  // Currently selected plant type key

        // Inventory (harvested plants)
        this.inventory = [];       // Array of { type, sellPrice }
        this.inventoryValue = 0;

        // Event system
        this.activeEvent = null;
        this.eventEndTime = 0;
        this.eventTimer = 0;       // Countdown to next event check
        this.eventCheckInterval = 5; // Check every 5 seconds
        this.EVENTS = {
            rain:  { name: 'Yağmur',   icon: '🌧️', desc: 'Bitkiler 2x hızla büyür!',     duration: 30, color: '#4488ff' },
            sale:  { name: 'Fırsat',   icon: '🏷️', desc: 'Tohumlar %30 indirimli!',       duration: 45, color: '#ffaa00' },
            bugs:  { name: 'Böcek',    icon: '🐛', desc: 'Her 5s\'de rastgele bitki ölür!', duration: 25, color: '#ff4444' },
            crowd: { name: 'Müşteri',  icon: '👥', desc: 'Satış değeri 2x!',               duration: 35, color: '#44ff88' },
            bonus: { name: 'Bonus',    icon: '✨', desc: 'Bonus para!',                    duration: 0,  color: '#ffdd00' },
        };
        this.bugTimer = 0; // For bug event, kill plant every 5s

        // Upgrade system
        this.UPGRADES = [
            { level: 1, cost: 0,    desc: '3 temel bitki' },
            { level: 2, cost: 200,  desc: 'Orkide açılır' },
            { level: 3, cost: 500,  desc: 'Papatya açılır' },
            { level: 4, cost: 1000, desc: 'Kaktüs açılır' },
            { level: 5, cost: 2000, desc: 'Bonsai açılır' },
            { level: 6, cost: 5000, desc: 'Kristal açılır' },
        ];
        this.fertilizerActive = false;  // +50% growth speed at $2000+ score
        this.goldenWater = false;       // 2x rain duration at $5000+ score

        // Visual effects
        this.particles = [];
        this.floatingTexts = [];
        this.time = 0;
        this.harvestGlow = [];  // Cells with ready-to-harvest glow

        // Shop scroll
        this.shopScrollY = 0;
        this.shopMaxScroll = 0;

        // Interaction state
        this.mouseX = -100;
        this.mouseY = -100;

        // Event listeners
        this._clickHandler = null;
        this._wheelHandler = null;
        this._moveHandler = null;

        // Button areas (computed in draw, used in click)
        this._sellBtnArea = null;
        this._quitBtnArea = null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.money = 100;
        this.displayMoney = 100;
        this.gameOver = false;
        this.selectedSeed = null;
        this.inventory = [];
        this.inventoryValue = 0;
        this.activeEvent = null;
        this.eventEndTime = 0;
        this.eventTimer = 0;
        this.bugTimer = 0;
        this.particles = [];
        this.floatingTexts = [];
        this.time = 0;
        this.shopScrollY = 0;
        this.fertilizerActive = false;
        this.goldenWater = false;
        this.mouseX = -100;
        this.mouseY = -100;

        // Layout
        this.shopX = 0;
        this.shopWidth = 175;
        const gridTotalWidth = this.GRID_SIZE * (this.CELL_SIZE + this.GRID_PADDING) - this.GRID_PADDING;
        const gridTotalHeight = this.GRID_SIZE * (this.CELL_SIZE + this.GRID_PADDING) - this.GRID_PADDING;
        const availableWidth = canvas.width - this.shopWidth - 20;
        this.gardenOffsetX = this.shopWidth + 10 + Math.floor((availableWidth - gridTotalWidth) / 2);
        this.gardenOffsetY = 65 + Math.floor((canvas.height - 65 - 75 - gridTotalHeight) / 2);

        // Initialize empty grid
        this.grid = [];
        for (let r = 0; r < this.GRID_SIZE; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.GRID_SIZE; c++) {
                this.grid[r][c] = null;
            }
        }

        this._bindEvents();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═══════════════════════════════════════════════════════════════════════════

    _bindEvents() {
        this._removeListeners();

        this._clickHandler = (e) => this._handleClick(e);
        this._wheelHandler = (e) => this._handleWheel(e);
        this._moveHandler = (e) => this._handleMove(e);

        this.canvas.addEventListener('click', this._clickHandler);
        this.canvas.addEventListener('wheel', this._wheelHandler, { passive: false });
        this.canvas.addEventListener('mousemove', this._moveHandler);
        this.canvas.addEventListener('mouseleave', () => { this.mouseX = -100; this.mouseY = -100; });
    }

    _removeListeners() {
        if (this._clickHandler) {
            this.canvas.removeEventListener('click', this._clickHandler);
            this._clickHandler = null;
        }
        if (this._wheelHandler) {
            this.canvas.removeEventListener('wheel', this._wheelHandler);
            this._wheelHandler = null;
        }
        if (this._moveHandler) {
            this.canvas.removeEventListener('mousemove', this._moveHandler);
            this._moveHandler = null;
        }
    }

    _handleMove(e) {
        if (this.gameOver) return;
        const pos = this._getCanvasPos(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;
    }

    _getCanvasPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    _handleWheel(e) {
        const pos = this._getCanvasPos(e);
        // Only scroll in shop area
        if (pos.x >= this.shopX && pos.x <= this.shopX + this.shopWidth) {
            e.preventDefault();
            this.shopScrollY = Math.max(0, Math.min(this.shopMaxScroll, this.shopScrollY + e.deltaY * 0.5));
        }
    }

    _handleClick(e) {
        if (this.gameOver) return;

        const pos = this._getCanvasPos(e);
        const { x, y } = pos;

        // Check sell button
        if (this._sellBtnArea) {
            const b = this._sellBtnArea;
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                this._sellAll();
                return;
            }
        }

        // Check quit button
        if (this._quitBtnArea) {
            const b = this._quitBtnArea;
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                this._triggerGameOver();
                return;
            }
        }

        // Check shop items
        if (x >= this.shopX && x <= this.shopX + this.shopWidth && y > 90) {
            this._handleShopClick(x, y);
            return;
        }

        // Check garden grid click
        this._handleGridClick(x, y);
    }

    _handleShopClick(x, y) {
        const startY = 95 - this.shopScrollY;
        const itemHeight = 62;
        let idx = 0;

        for (const key of this.PLANT_KEYS) {
            const plant = this.PLANTS[key];
            const itemY = startY + idx * itemHeight;
            const isUnlocked = this.score >= plant.unlock;

            if (y >= itemY && y < itemY + itemHeight && isUnlocked) {
                const cost = this._getPlantCost(key);
                if (this.money >= cost) {
                    this.selectedSeed = key;
                    if (window.soundManager) window.soundManager.playClick();
                }
                return;
            }
            idx++;
        }
    }

    _handleGridClick(x, y) {
        const gridTotalSize = this.GRID_SIZE * (this.CELL_SIZE + this.GRID_PADDING) - this.GRID_PADDING;
        const relX = x - this.gardenOffsetX;
        const relY = y - this.gardenOffsetY;

        if (relX < 0 || relY < 0 || relX > gridTotalSize || relY > gridTotalSize) return;

        const c = Math.floor(relX / (this.CELL_SIZE + this.GRID_PADDING));
        const r = Math.floor(relY / (this.CELL_SIZE + this.GRID_PADDING));

        if (r < 0 || r >= this.GRID_SIZE || c < 0 || c >= this.GRID_SIZE) return;

        const cell = this.grid[r][c];

        if (cell === null && this.selectedSeed) {
            // Plant a seed
            const cost = this._getPlantCost(this.selectedSeed);
            if (this.money >= cost) {
                this.money -= cost;
                this.grid[r][c] = {
                    type: this.selectedSeed,
                    plantedAt: Date.now(),
                    ready: false,
                    growthOffset: 0,  // Extra growth from rain etc.
                };
                if (window.soundManager) window.soundManager.playPlace();

                // Spawn planting particles
                const cellX = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                const cellY = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                this._spawnParticles(cellX, cellY, '#8B6914', 6);
            }
        } else if (cell && cell.ready) {
            // Harvest
            const plant = this.PLANTS[cell.type];
            let sellPrice = plant.sell;
            if (this.activeEvent === 'crowd') sellPrice *= 2;

            this.inventory.push({ type: cell.type, sellPrice });
            this._recalcInventoryValue();
            this.grid[r][c] = null;

            // Harvest effects
            const cellX = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
            const cellY = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
            this._spawnParticles(cellX, cellY, plant.color, 10);
            this._addFloatingText(`+${plant.icon}`, cellX, cellY, plant.color);

            if (window.soundManager) window.soundManager.playDing();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UPDATE LOOP
    // ═══════════════════════════════════════════════════════════════════════════

    update(dt) {
        if (this.gameOver) return;
        this.time += dt;

        // Money Ticker Interpolation (Smooth UI)
        const diff = this.money - this.displayMoney;
        if (Math.abs(diff) < 0.5) {
            this.displayMoney = this.money;
        } else {
            this.displayMoney += diff * 10 * dt;
        }

        // Update plant growth
        const now = Date.now();
        let growthMultiplier = 1;
        if (this.activeEvent === 'rain') growthMultiplier = 2;
        if (this.fertilizerActive) growthMultiplier *= 1.5;

        for (let r = 0; r < this.GRID_SIZE; r++) {
            for (let c = 0; c < this.GRID_SIZE; c++) {
                const cell = this.grid[r][c];
                if (cell && !cell.ready) {
                    const plant = this.PLANTS[cell.type];
                    const elapsed = (now - cell.plantedAt) / 1000 + cell.growthOffset;
                    const adjustedTime = elapsed * growthMultiplier / (growthMultiplier > 1 ? 1 : 1);
                    // We track real elapsed time but apply multiplier via growthOffset
                    // Actually, simplify: just check if accumulated growth >= growTime
                    const totalGrowth = ((now - cell.plantedAt) / 1000) * growthMultiplier + cell.growthOffset;
                    if (totalGrowth >= plant.growTime && !cell.ready) {
                        cell.ready = true;
                        // Ready glow effect
                        const cx = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                        const cy = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                        this._spawnParticles(cx, cy, '#ffff00', 8);
                    }
                }
            }
        }

        // Event system
        this.eventTimer += dt;
        if (this.eventTimer >= this.eventCheckInterval) {
            this.eventTimer = 0;
            if (!this.activeEvent) {
                this._tryTriggerEvent();
            }
        }

        // Active event expiry
        if (this.activeEvent && this.activeEvent !== 'bonus') {
            if (Date.now() >= this.eventEndTime) {
                this.activeEvent = null;
            }
        }

        // Bug event: kill random plant every 5s
        if (this.activeEvent === 'bugs') {
            this.bugTimer += dt;
            if (this.bugTimer >= 5) {
                this.bugTimer = 0;
                this._killRandomPlant();
            }
        }

        // Check upgrades
        if (this.score >= 2000 && !this.fertilizerActive) {
            this.fertilizerActive = true;
            this._addFloatingText('🧪 Gübre Aktif!', this.canvas.width / 2, 100, '#44ff88');
        }
        if (this.score >= 5000 && !this.goldenWater) {
            this.goldenWater = true;
            this._addFloatingText('✨ Altın Sulama!', this.canvas.width / 2, 100, '#ffdd00');
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 80 * dt; // gravity
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= 40 * dt;
            ft.life -= dt;
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DRAWING
    // ═══════════════════════════════════════════════════════════════════════════

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#060612';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle background pattern
        ctx.fillStyle = 'rgba(30, 60, 30, 0.04)';
        for (let i = 0; i < canvas.width; i += 40) {
            for (let j = 0; j < canvas.height; j += 40) {
                if ((Math.floor(i / 40) + Math.floor(j / 40)) % 2 === 0) {
                    ctx.fillRect(i, j, 40, 40);
                }
            }
        }

        // Event background tint
        if (this.activeEvent && this.EVENTS[this.activeEvent]) {
            const evtColor = this.EVENTS[this.activeEvent].color;
            ctx.fillStyle = evtColor.replace(')', ', 0.03)').replace('rgb', 'rgba').replace('#', '');
            // Simpler approach
            ctx.save();
            ctx.globalAlpha = 0.04;
            ctx.fillStyle = evtColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        this._drawTopBar();
        this._drawShop();
        this._drawGarden();
        this._drawBottomBar();
        this._drawEventBanner();
        this._drawParticles();
        this._drawFloatingTexts();
    }

    _drawTopBar() {
        const { ctx, canvas } = this;
        const barHeight = 60;

        // Premium glassmorphism base
        const grad = ctx.createLinearGradient(0, 0, 0, barHeight);
        grad.addColorStop(0, 'rgba(12, 16, 32, 0.95)');
        grad.addColorStop(1, 'rgba(6, 8, 20, 0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, barHeight);

        // Glowing bottom border
        const borderGrad = ctx.createLinearGradient(0, barHeight - 2, canvas.width, barHeight - 2);
        borderGrad.addColorStop(0, 'rgba(0, 212, 255, 0)');
        borderGrad.addColorStop(0.3, 'rgba(0, 212, 255, 0.8)');
        borderGrad.addColorStop(0.5, 'rgba(68, 255, 136, 1)');
        borderGrad.addColorStop(0.7, 'rgba(0, 212, 255, 0.8)');
        borderGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = borderGrad;
        ctx.fillRect(0, barHeight - 2, canvas.width, 2);

        // Money Ticker State & Colors
        const isTickingUp = this.displayMoney < this.money - 0.5;
        const isTickingDown = this.displayMoney > this.money + 0.5;
        let moneyColor = '#44ff88'; // Normal green
        let shadowColor = 'rgba(68, 255, 136, 0.8)';
        // Shake logic for when spending money (ticking down)
        let moneyX = 25;
        let moneyY = barHeight / 2;

        if (isTickingDown) {
            moneyColor = '#ff4444';
            shadowColor = 'rgba(255, 68, 68, 0.8)';
            moneyX += (Math.random() - 0.5) * 3;
            moneyY += (Math.random() - 0.5) * 3;
        } else if (isTickingUp) {
            moneyColor = '#00d4ff';
            shadowColor = 'rgba(0, 212, 255, 0.8)';
            moneyY -= 1; // Slight lift effect when gaining
        }

        // Money icon & display
        ctx.save();
        ctx.fillStyle = moneyColor;
        ctx.font = '800 24px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 15;
        const moneyText = `💰 $${Math.floor(this.displayMoney)}`;
        ctx.fillText(moneyText, moneyX, moneyY);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Main Title
        ctx.save();
        ctx.font = '900 22px Orbitron, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Title gradient
        const tGrad = ctx.createLinearGradient(canvas.width/2 - 100, 0, canvas.width/2 + 100, 0);
        tGrad.addColorStop(0, '#00d4ff');
        tGrad.addColorStop(0.5, '#44ff88');
        tGrad.addColorStop(1, '#00d4ff');
        ctx.fillStyle = tGrad;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fillText('G A R D E N   E M P I R E', canvas.width / 2 + 40, barHeight / 2 - 8);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#8899aa';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(`TOTAL REVENUE: $${Math.floor(this.score)}`, canvas.width / 2 + 40, barHeight / 2 + 14);
        ctx.letterSpacing = '0px';
        ctx.restore();

        // Quit Button (Hover active)
        const quitW = 80;
        const quitH = 30;
        const quitX = canvas.width - quitW - 20;
        const quitY = (barHeight - quitH) / 2;
        this._quitBtnArea = { x: quitX, y: quitY, w: quitW, h: quitH };

        const isHover = (this.mouseX >= quitX && this.mouseX <= quitX + quitW && this.mouseY >= quitY && this.mouseY <= quitY + quitH);
        
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(quitX, quitY, quitW, quitH, 8);
        ctx.fillStyle = isHover ? 'rgba(255, 68, 68, 0.25)' : 'rgba(255, 68, 68, 0.1)';
        ctx.fill();
        ctx.strokeStyle = isHover ? '#ff4444' : 'rgba(255, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        if (isHover) {
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 10;
        }
        ctx.stroke();
        
        ctx.fillStyle = isHover ? '#ffffff' : '#ff6666';
        ctx.font = '700 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BITIR ✕', quitX + quitW / 2, quitY + quitH / 2);
        ctx.restore();
    }

    _drawShop() {
        const { ctx, canvas } = this;
        const shopY = 60;
        const shopH = canvas.height - shopY;

        // Premium frosted panel
        const bGrad = ctx.createLinearGradient(this.shopX, shopY, this.shopWidth, shopY);
        bGrad.addColorStop(0, 'rgba(6, 10, 20, 0.95)');
        bGrad.addColorStop(1, 'rgba(10, 15, 30, 0.9)');
        ctx.fillStyle = bGrad;
        ctx.fillRect(this.shopX, shopY, this.shopWidth, shopH);

        // Right glowing border
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.fillRect(this.shopWidth - 1, shopY, 1, shopH);
        
        // Inner shadow on the right line
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.shopWidth - 2, shopY, 2, shopH);
        ctx.shadowBlur = 0;

        // Title
        ctx.fillStyle = '#00d4ff';
        ctx.font = '800 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 8;
        ctx.fillText('🌱 SEED SHOP', this.shopWidth / 2, shopY + 22);
        ctx.shadowBlur = 0;

        // Separator
        ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.fillRect(10, shopY + 40, this.shopWidth - 20, 1);

        // Draw plant items
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.shopX, shopY + 45, this.shopWidth, shopH - 45);
        ctx.clip();

        const itemHeight = 65;
        const startY = shopY + 52 - this.shopScrollY;
        let idx = 0;
        let totalHeight = 0;

        for (const key of this.PLANT_KEYS) {
            const plant = this.PLANTS[key];
            const iy = startY + idx * itemHeight;
            const isUnlocked = this.score >= plant.unlock;
            const isSelected = this.selectedSeed === key;
            const cost = this._getPlantCost(key);
            const canAfford = this.money >= cost;

            const isHover = isUnlocked && 
                (this.mouseX >= this.shopX + 8 && this.mouseX <= this.shopWidth - 8 &&
                 this.mouseY >= iy && this.mouseY <= iy + itemHeight - 8);

            // Item background (rounded glass)
            ctx.beginPath();
            ctx.roundRect(this.shopX + 8, iy, this.shopWidth - 16, itemHeight - 8, 8);
            
            if (isSelected) {
                ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
            } else if (isHover) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            }
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#00d4ff';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (isHover) {
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            if (!isUnlocked) {
                // Locked frosted glass
                ctx.fillStyle = 'rgba(5, 5, 10, 0.8)';
                ctx.fill();

                ctx.fillStyle = '#ff4466';
                ctx.font = '700 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔒', this.shopWidth / 2, iy + 20);

                ctx.fillStyle = '#667788';
                ctx.font = '600 9px Inter, sans-serif';
                ctx.fillText(`REQ: $${plant.unlock}`, this.shopWidth / 2, iy + 36);

                ctx.fillStyle = '#445566';
                ctx.fillText(plant.name, this.shopWidth / 2, iy + 48);
            } else {
                // Plant icon with glow
                ctx.font = '24px serif';
                ctx.textAlign = 'left';
                ctx.fillText(plant.icon, this.shopX + 16, iy + 26);

                // Plant name
                ctx.fillStyle = canAfford ? '#ffffff' : '#778899';
                ctx.font = '700 13px Inter, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(plant.name, this.shopX + 48, iy + 18);

                // Cost
                ctx.fillStyle = canAfford ? '#44ff88' : '#ff4444';
                ctx.font = '800 12px Inter, sans-serif';
                if (!canAfford) {
                    ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 5;
                }
                ctx.fillText(`$${cost}`, this.shopX + 48, iy + 34);
                ctx.shadowBlur = 0;

                // Growth time
                ctx.fillStyle = '#8899aa';
                ctx.font = '500 10px Inter, sans-serif';
                ctx.fillText(`⏱ ${plant.growTime}s`, this.shopX + 48, iy + 48);

                // Sell value
                const sellVal = this.activeEvent === 'crowd' ? plant.sell * 2 : plant.sell;
                ctx.fillStyle = '#00d4ff'; // neon cyan value
                ctx.fillText(`💰$${sellVal}`, this.shopX + 100, iy + 48);
                
                if(isSelected) {
                    // Pulse indicator dot
                    const dotPulse = 0.5 + Math.sin(this.time * 6) * 0.5;
                    ctx.fillStyle = `rgba(0, 212, 255, ${dotPulse})`;
                    ctx.beginPath();
                    ctx.arc(this.shopWidth - 20, iy + 20, 4, 0, Math.PI*2);
                    ctx.shadowColor = '#00d4ff';
                    ctx.shadowBlur = 8;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            idx++;
            totalHeight = idx * itemHeight;
        }

        this.shopMaxScroll = Math.max(0, totalHeight - (shopH - 70));
        ctx.restore();

        // Balance at bottom of shop
        const balY = canvas.height - 20;
        const balH = 40;
        ctx.fillStyle = 'rgba(6, 10, 20, 0.95)';
        ctx.fillRect(this.shopX, canvas.height - balH, this.shopWidth, balH);
        
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.fillRect(this.shopX, canvas.height - balH, this.shopWidth, 1);
        
        ctx.fillStyle = (this.displayMoney > this.money + 0.5) ? '#ff4444' : '#44ff88';
        ctx.font = '700 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`BAKİYE: $${Math.floor(this.displayMoney)}`, this.shopWidth / 2, balY);
    }

    _drawGarden() {
        const { ctx } = this;
        const now = Date.now();
        let growthMultiplier = 1;
        if (this.activeEvent === 'rain') growthMultiplier = 2;
        if (this.fertilizerActive) growthMultiplier *= 1.5;

        for (let r = 0; r < this.GRID_SIZE; r++) {
            for (let c = 0; c < this.GRID_SIZE; c++) {
                const cellX = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING);
                const cellY = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING);
                const cell = this.grid[r][c];

                // Premium Soil Base (Futuristic Pod)
                ctx.fillStyle = 'rgba(12, 16, 24, 0.8)';
                ctx.beginPath();
                ctx.roundRect(cellX, cellY, this.CELL_SIZE, this.CELL_SIZE, 12);
                ctx.fill();

                // Pod inner gradient
                const podGrad = ctx.createLinearGradient(cellX, cellY, cellX, cellY + this.CELL_SIZE);
                podGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                podGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
                ctx.fillStyle = podGrad;
                ctx.fill();
                
                // Border 
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Empty cell hover/target indicator
                if (cell === null && this.selectedSeed) {
                    const isHover = (this.mouseX >= cellX && this.mouseX <= cellX + this.CELL_SIZE &&
                                     this.mouseY >= cellY && this.mouseY <= cellY + this.CELL_SIZE);
                    
                    if (isHover) {
                        ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
                        ctx.fill();
                        ctx.strokeStyle = '#00d4ff';
                        ctx.lineWidth = 2;
                        ctx.shadowColor = '#00d4ff';
                        ctx.shadowBlur = 10;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.fillStyle = 'rgba(0, 212, 255, 0.02)';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([4, 4]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }

                if (cell) {
                    const plant = this.PLANTS[cell.type];
                    const totalGrowth = ((now - cell.plantedAt) / 1000) * growthMultiplier + cell.growthOffset;
                    const progress = Math.min(1, totalGrowth / plant.growTime);

                    this._drawPlant(ctx, cellX, cellY, cell, plant, progress);
                }
            }
        }

        // Garden border futuristic frame
        const gridW = this.GRID_SIZE * (this.CELL_SIZE + this.GRID_PADDING) - this.GRID_PADDING;
        const gridH = gridW;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.gardenOffsetX - 8, this.gardenOffsetY - 8, gridW + 16, gridH + 16, 16);
        ctx.stroke();
        
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    _drawPlant(ctx, cellX, cellY, cell, plant, progress) {
        const centerX = cellX + this.CELL_SIZE / 2;
        const centerY = cellY + this.CELL_SIZE / 2;
        const bounce = Math.sin(this.time * 2) * 1.5;

        if (progress < 0.25) {
            // Stage 1: SEED - small brown dot
            ctx.fillStyle = '#8B6914';
            ctx.shadowColor = '#8B6914';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(centerX, centerY + 10, 4 + progress * 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (progress < 0.50) {
            // Stage 2: SPROUT - small green stem + tiny leaves
            const stemH = 10 + (progress - 0.25) * 60;   // 10 to 25
            const stemTopY = centerY + 10 - stemH;

            // Stem
            ctx.strokeStyle = '#4a9f4a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 10);
            ctx.lineTo(centerX, stemTopY + bounce);
            ctx.stroke();

            // Leaves
            ctx.fillStyle = '#5cb85c';
            ctx.beginPath();
            ctx.ellipse(centerX - 6, stemTopY + 5 + bounce, 5, 3, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 6, stemTopY + 8 + bounce, 5, 3, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Root dot
            ctx.fillStyle = '#8B6914';
            ctx.beginPath();
            ctx.arc(centerX, centerY + 12, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (progress < 0.75) {
            // Stage 3: GROWING - medium plant with leaves
            const p = (progress - 0.5) / 0.25; // 0-1 within this stage
            const stemH = 25 + p * 10;
            const stemTopY = centerY + 10 - stemH;

            // Stem
            ctx.strokeStyle = '#3d8b3d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 10);
            ctx.lineTo(centerX, stemTopY + bounce);
            ctx.stroke();

            // Multiple leaves
            ctx.fillStyle = '#4caf50';
            const leafSize = 7 + p * 4;
            ctx.beginPath();
            ctx.ellipse(centerX - 9, stemTopY + 12 + bounce, leafSize, 4, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 9, stemTopY + 16 + bounce, leafSize, 4, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX - 5, stemTopY + 5 + bounce, leafSize - 2, 3, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Small bud
            ctx.fillStyle = plant.accent;
            ctx.beginPath();
            ctx.arc(centerX, stemTopY + bounce, 4 + p * 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Stage 4: MATURE - full bloom
            const stemH = 35;
            const stemTopY = centerY + 10 - stemH;

            // Stem
            ctx.strokeStyle = '#2d6b2d';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 10);
            ctx.lineTo(centerX, stemTopY + bounce);
            ctx.stroke();

            // Leaves
            ctx.fillStyle = '#388e3c';
            ctx.beginPath();
            ctx.ellipse(centerX - 10, stemTopY + 18 + bounce, 10, 5, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 10, stemTopY + 22 + bounce, 10, 5, 0.5, 0, Math.PI * 2);
            ctx.fill();

            // Flower / bloom
            this._drawBloom(ctx, centerX, stemTopY + bounce, plant, cell.type);

            // Ready glow effect
            if (cell.ready) {
                ctx.save();
                const pulse = 0.4 + Math.sin(this.time * 4) * 0.2;
                ctx.strokeStyle = plant.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = pulse;
                ctx.shadowColor = plant.color;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.roundRect(cellX + 2, cellY + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4, 5);
                ctx.stroke();
                ctx.restore();

                // Ready indicator
                ctx.fillStyle = '#ffff00';
                ctx.font = '700 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 8;
                ctx.fillText('✦', cellX + this.CELL_SIZE - 10, cellY + 10);
                ctx.shadowBlur = 0;
            }
        }

        // Progress bar
        if (!cell.ready) {
            const barW = this.CELL_SIZE - 10;
            const barH = 3;
            const barX = cellX + 5;
            const barY = cellY + this.CELL_SIZE - 8;

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = progress < 0.5 ? '#ffaa00' : '#44ff88';
            ctx.fillRect(barX, barY, barW * progress, barH);
        }
    }

    _drawBloom(ctx, cx, cy, plant, type) {
        ctx.save();
        ctx.shadowColor = plant.color;
        ctx.shadowBlur = 12;

        switch (type) {
            case 'rose':
                // Rose: concentric petals
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.fillStyle = plant.color;
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(angle) * 6,
                        cy + Math.sin(angle) * 6,
                        8, 5,
                        angle, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.fillStyle = '#ff6688';
                ctx.beginPath();
                ctx.arc(cx, cy, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'tulip':
                // Tulip: cup shape
                ctx.fillStyle = plant.color;
                ctx.beginPath();
                ctx.moveTo(cx - 8, cy + 3);
                ctx.quadraticCurveTo(cx - 10, cy - 12, cx, cy - 14);
                ctx.quadraticCurveTo(cx + 10, cy - 12, cx + 8, cy + 3);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = plant.accent;
                ctx.beginPath();
                ctx.moveTo(cx - 4, cy + 2);
                ctx.quadraticCurveTo(cx, cy - 10, cx + 4, cy + 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'sunflower':
                // Sunflower: petals + dark center
                for (let i = 0; i < 10; i++) {
                    const angle = (i / 10) * Math.PI * 2;
                    ctx.fillStyle = '#ffdd00';
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(angle) * 8,
                        cy + Math.sin(angle) * 8,
                        7, 3.5,
                        angle, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.fillStyle = '#553300';
                ctx.beginPath();
                ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#664411';
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'orchid':
                // Orchid: exotic petals
                const angles = [0, 72, 144, 216, 288];
                angles.forEach(deg => {
                    const rad = deg * Math.PI / 180;
                    ctx.fillStyle = plant.color;
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(rad) * 7,
                        cy + Math.sin(rad) * 7,
                        7, 4,
                        rad, 0, Math.PI * 2
                    );
                    ctx.fill();
                });
                ctx.fillStyle = '#ff88dd';
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'smile':
                // Daisy: white petals
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(angle) * 7,
                        cy + Math.sin(angle) * 7,
                        6, 3,
                        angle, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.fillStyle = '#ffdd44';
                ctx.beginPath();
                ctx.arc(cx, cy, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'cactus':
                // Cactus: round body + arms
                ctx.fillStyle = plant.color;
                ctx.beginPath();
                ctx.roundRect(cx - 6, cy - 12, 12, 20, 6);
                ctx.fill();
                // Arms
                ctx.beginPath();
                ctx.roundRect(cx - 14, cy - 6, 8, 4, 3);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(cx + 6, cy - 8, 8, 4, 3);
                ctx.fill();
                // Flower on top
                ctx.fillStyle = '#ff66aa';
                ctx.beginPath();
                ctx.arc(cx, cy - 14, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'bonsai':
                // Bonsai: tree shape
                ctx.fillStyle = '#553322';
                ctx.fillRect(cx - 2, cy - 5, 4, 15);
                // Canopy
                ctx.fillStyle = plant.color;
                ctx.beginPath();
                ctx.arc(cx, cy - 10, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = plant.accent;
                ctx.beginPath();
                ctx.arc(cx - 5, cy - 12, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 5, cy - 8, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'crystal':
                // Crystal: geometric shape with glow
                ctx.fillStyle = plant.color;
                ctx.beginPath();
                ctx.moveTo(cx, cy - 16);
                ctx.lineTo(cx + 8, cy - 4);
                ctx.lineTo(cx + 5, cy + 8);
                ctx.lineTo(cx - 5, cy + 8);
                ctx.lineTo(cx - 8, cy - 4);
                ctx.closePath();
                ctx.fill();
                // Inner shine
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.moveTo(cx - 2, cy - 12);
                ctx.lineTo(cx + 4, cy - 4);
                ctx.lineTo(cx + 1, cy + 4);
                ctx.lineTo(cx - 4, cy - 2);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    _drawBottomBar() {
        const { ctx, canvas } = this;
        const barH = 55;
        const barY = canvas.height - barH;

        // Premium translucent bar
        ctx.fillStyle = 'rgba(6, 10, 20, 0.95)';
        ctx.fillRect(this.shopWidth, barY, canvas.width - this.shopWidth, barH);

        // Top border with glowing gradient
        const grad = ctx.createLinearGradient(this.shopWidth, barY, canvas.width, barY);
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
        grad.addColorStop(0.5, 'rgba(68, 255, 136, 0.8)');
        grad.addColorStop(1, 'rgba(0, 212, 255, 0.1)');
        ctx.fillStyle = grad;
        ctx.fillRect(this.shopWidth, barY, canvas.width - this.shopWidth, 2);
        
        // Inner shadow glow
        ctx.shadowColor = '#44ff88';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.shopWidth, barY, canvas.width - this.shopWidth, 1);
        ctx.shadowBlur = 0;

        // Inventory count
        ctx.fillStyle = '#00d4ff';
        ctx.font = '700 13px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📦 INVENTORY: ${this.inventory.length} items`, this.shopWidth + 25, barY + barH / 2);

        // Sell button
        const btnW = 200;
        const btnH = 36;
        const btnX = canvas.width / 2 + 60 - btnW / 2;
        const btnY = barY + (barH - btnH) / 2;
        this._sellBtnArea = { x: btnX, y: btnY, w: btnW, h: btnH };
        
        const isBtnHover = (this.mouseX >= btnX && this.mouseX <= btnX + btnW && this.mouseY >= btnY && this.mouseY <= btnY + btnH);

        if (this.inventory.length > 0) {
            // Active sell button
            ctx.fillStyle = isBtnHover ? 'rgba(68, 255, 136, 0.25)' : 'rgba(68, 255, 136, 0.15)';
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 8);
            ctx.fill();
            
            ctx.strokeStyle = isBtnHover ? '#44ff88' : 'rgba(68, 255, 136, 0.5)';
            ctx.lineWidth = 1.5;
            if (isBtnHover) {
                ctx.shadowColor = '#44ff88';
                ctx.shadowBlur = 10;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = isBtnHover ? '#ffffff' : '#44ff88';
            ctx.font = '800 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`SELL ALL - $${this.inventoryValue}`, btnX + btnW / 2, btnY + btnH / 2);
        } else {
            // Inactive
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 8);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#445566';
            ctx.font = '700 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SELL ALL - $0', btnX + btnW / 2, btnY + btnH / 2);
        }

        // Active seed indicator (right side)
        if (this.selectedSeed) {
            const seed = this.PLANTS[this.selectedSeed];
            ctx.fillStyle = '#8899aa';
            ctx.font = '700 12px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`SELECTED: ${seed.icon} ${seed.name}`, canvas.width - 25, barY + barH / 2);
        }
    }

    _drawEventBanner() {
        const { ctx, canvas } = this;
        if (!this.activeEvent || !this.EVENTS[this.activeEvent]) return;

        const evt = this.EVENTS[this.activeEvent];
        const bannerH = 34;
        const bannerY = 60;

        ctx.save();
        
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = evt.color;
        ctx.shadowColor = evt.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(this.shopWidth, bannerY, canvas.width - this.shopWidth, bannerH);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Overlay to darken
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.shopWidth, bannerY, canvas.width - this.shopWidth, bannerH);

        // Event text
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = evt.color;
        ctx.shadowBlur = 10;
        ctx.font = '800 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const remaining = Math.max(0, Math.ceil((this.eventEndTime - Date.now()) / 1000));
        ctx.fillText(
            `${evt.icon} ${evt.name.toUpperCase()} - ${evt.desc} ${remaining > 0 ? `(${remaining}s)` : ''}`,
            this.shopWidth + (canvas.width - this.shopWidth) / 2,
            bannerY + bannerH / 2
        );
        
        ctx.restore();
    }

    _drawParticles() {
        const { ctx } = this;
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * Math.max(0, p.life), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    _drawFloatingTexts() {
        const { ctx } = this;
        this.floatingTexts.forEach(ft => {
            ctx.globalAlpha = Math.min(1, ft.life * 2);
            ctx.fillStyle = ft.color;
            ctx.font = '700 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 8;
            ctx.fillText(ft.text, ft.x, ft.y);
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME LOGIC HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    _getPlantCost(key) {
        const plant = this.PLANTS[key];
        let cost = plant.cost;
        if (this.activeEvent === 'sale') {
            cost = Math.floor(cost * 0.7); // 30% discount
        }
        return cost;
    }

    _sellAll() {
        if (this.inventory.length === 0) return;

        const total = this.inventoryValue;
        this.money += total;
        this.score += total;

        // Visual effects
        this._addFloatingText(
            `+$${total}`,
            this.canvas.width / 2 + 60,
            this.canvas.height - 80,
            '#44ff88'
        );
        this._spawnParticles(this.canvas.width / 2 + 60, this.canvas.height - 70, '#44ff88', 15);

        if (total >= 100) {
            if (window.soundManager) window.soundManager.playWin();
            if (window.gameManager) window.gameManager.shakeScreen(0.3);
        } else {
            if (window.soundManager) window.soundManager.playScore();
        }

        this.inventory = [];
        this.inventoryValue = 0;

        // Update high score
        if (window.gameManager) {
            window.gameManager.checkAndUpdateHighScore('gardenempire', this.score);
        }
    }

    _recalcInventoryValue() {
        this.inventoryValue = this.inventory.reduce((sum, item) => sum + item.sellPrice, 0);
    }

    _tryTriggerEvent() {
        // Need at least 3 plants in garden
        const plantCount = this.grid.flat().filter(p => p).length;
        if (plantCount < 3) return;

        const rand = Math.random() * 100;
        let event = null;

        if (rand < 4) event = 'bonus';
        else if (rand < 9) event = 'crowd';
        else if (rand < 16) event = 'bugs';
        else if (rand < 24) event = 'sale';
        else if (rand < 30) event = 'rain';

        if (event) this._startEvent(event);
    }

    _startEvent(type) {
        if (type === 'bonus') {
            // Instant bonus
            const bonus = 25 + Math.floor(Math.random() * 76); // 25-100
            this.money += bonus;
            this.score += bonus;
            this._addFloatingText(`+$${bonus} BONUS!`, this.canvas.width / 2, 120, '#ffdd00');
            this._spawnParticles(this.canvas.width / 2, 120, '#ffdd00', 12);
            if (window.soundManager) window.soundManager.playWin();
            if (window.gameManager) {
                window.gameManager.checkAndUpdateHighScore('gardenempire', this.score);
            }
            return;
        }

        this.activeEvent = type;
        let duration = this.EVENTS[type].duration;
        if (type === 'rain' && this.goldenWater) duration *= 2;
        this.eventEndTime = Date.now() + duration * 1000;
        this.bugTimer = 0;

        if (window.soundManager) window.soundManager.playTick();
    }

    _killRandomPlant() {
        const plants = [];
        for (let r = 0; r < this.GRID_SIZE; r++) {
            for (let c = 0; c < this.GRID_SIZE; c++) {
                if (this.grid[r][c]) plants.push({ r, c });
            }
        }
        if (plants.length === 0) return;

        const target = plants[Math.floor(Math.random() * plants.length)];
        const cell = this.grid[target.r][target.c];
        const plant = this.PLANTS[cell.type];

        // Death effects
        const cx = this.gardenOffsetX + target.c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
        const cy = this.gardenOffsetY + target.r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
        this._spawnParticles(cx, cy, '#ff4444', 8);
        this._addFloatingText('🐛 ✕', cx, cy, '#ff4444');

        this.grid[target.r][target.c] = null;
        if (window.soundManager) window.soundManager.playDeath();
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200 - 50,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 1.5,
                color
            });
        }
    }

    _addFloatingText(text, x, y, color) {
        this.floatingTexts.push({
            text, x, y,
            color,
            life: 1.5
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME OVER
    // ═══════════════════════════════════════════════════════════════════════════

    _triggerGameOver() {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        if (window.gameManager) {
            window.gameManager.checkAndUpdateHighScore('gardenempire', this.score);
        }
        this._removeListeners();
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager ? window.gameManager.getHighScore('gardenempire') : 0;
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">🌿 Bahçe Kapandı!</div>
            <div class="game-over-score">Toplam Kazanç: $${Math.floor(this.score)}</div>
            ${isNew ? '<div class="game-over-new">🎉 YENİ REKOR!</div>' : `<div class="game-over-highscore">🏆 Rekor: $${hs}</div>`}
            <button class="game-over-btn" id="garden-restart">↻ Tekrar Oyna</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#garden-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME MANAGER INTERFACE
    // ═══════════════════════════════════════════════════════════════════════════

    getScore() { return Math.floor(this.score); }
    isGameOver() { return this.gameOver; }

    pause() {
        this._removeListeners();
    }

    resume() {
        this._bindEvents();
    }

    destroy() {
        this._removeListeners();
    }
}

// Register with GameManager
window.gameManager.registerGame('gardenempire', GardenEmpire, {
    name: 'Garden Empire',
    canvasWidth: 880,
    canvasHeight: 540
});
