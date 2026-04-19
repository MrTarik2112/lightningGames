// ═══════════════════════════════════════════════════════════════════════════════
// GARDEN EMPIRE - The Grand Conservatory
// Grow plants, harvest, sell, and build your garden empire!
// Theme: Natural Botanical Greenhouse (No Neon)
// ═══════════════════════════════════════════════════════════════════════════════

class GardenEmpire {
    constructor() {
        this.canvas = null;
        this.ctx = null;

        // Game state
        this.score = 0;
        this.money = 10;
        this.displayMoney = 10;
        this.moneyPulse = 1.0;
        this.gameOver = false;
        this.bugRepellent = false;
        this.autoHarvester = false;
        this.dayRatio = 1.0; // 1 = High Noon, 0 = Midnight

        // Progression
        this.unlockedSize = 4; // Start with 4x4
        this.xp = 0;
        this.level = 1;
        this.xpToNextLevel = 100;
        this.levelMultiplier = 1.0;

        // Layout constants (Safe Area System)
        this.LAYOUT = {
            TOP_BAR_H: 58,
            BOTTOM_BAR_H: 65,
            SHOP_W: 220,
            GRID_SIZE: 6,
            CELL_SIZE: 52, // Reduced from 64
            CELL_PAD: 4,
        };

        // Garden grid
        this.GRID_SIZE = 6;
        this.CELL_SIZE = 52;
        this.GRID_PADDING = 4;
        this.grid = [];

        // Layout offsets (calculated in init)
        this.gardenOffsetX = 0;
        this.gardenOffsetY = 0;
        this.shopX = 0;
        this.shopWidth = 220; // Sync with LAYOUT

        // Plant definitions
        this.PLANTS = {
            rose: { name: 'Rose', cost: 10, growTime: 15, sell: 15, color: '#c94060', accent: '#e88099', bloomColor: '#a82040', icon: '🌹', unlock: 0 },
            tulip: { name: 'Tulip', cost: 20, growTime: 25, sell: 30, color: '#d47020', accent: '#e89858', bloomColor: '#b85810', icon: '🌷', unlock: 0 },
            sunflower: { name: 'Sunflower', cost: 35, growTime: 40, sell: 52, color: '#d4a520', accent: '#e8c860', bloomColor: '#b88b10', icon: '🌻', unlock: 0 },
            orchid: { name: 'Orchid', cost: 60, growTime: 60, sell: 90, color: '#9040b0', accent: '#b878d0', bloomColor: '#7828a0', icon: '🪻', unlock: 200 },
            smile: { name: 'Daisy', cost: 90, growTime: 90, sell: 135, color: '#f0ead0', accent: '#f5f0e0', bloomColor: '#e8dfc0', icon: '🌼', unlock: 500 },
            cactus: { name: 'Cactus', cost: 120, growTime: 45, sell: 180, color: '#508840', accent: '#70a860', bloomColor: '#387030', icon: '🌵', unlock: 1000 },
            bonsai: { name: 'Bonsai', cost: 200, growTime: 120, sell: 320, color: '#2d6b3a', accent: '#4a8b58', bloomColor: '#1a5028', icon: '🌳', unlock: 2000 },
            flytrap: { name: 'Flytrap', cost: 800, growTime: 90, sell: 1400, color: '#88cc44', accent: '#cc4444', bloomColor: '#ff2222', icon: '🪴', unlock: 3000 },
            crystal: { name: 'Crystal', cost: 350, growTime: 150, sell: 560, color: '#88c8d8', accent: '#a8dbe8', bloomColor: '#68b0c0', icon: '💎', unlock: 5000 },
            mushroom: { name: 'Mushroom', cost: 1500, growTime: 140, sell: 3000, color: '#6688aa', accent: '#44aaff', bloomColor: '#88ccff', icon: '🍄', unlock: 8000 },
            yggdrasil: { name: 'Yggdrasil', cost: 8000, growTime: 250, sell: 25000, color: '#3d6b38', accent: '#5ab85c', bloomColor: '#b8cc66', icon: '🌲', unlock: 20000 },
            
            // Category A: Fruit Trees (multi-harvest)
            apple: { name: 'Apple Tree', cost: 500, growTime: 60, sell: 800, color: '#cc3333', accent: '#ee5544', bloomColor: '#99aa22', icon: '🍎', unlock: 15000, multiHarvest: 3 },
            cherry: { name: 'Cherry Tree', cost: 800, growTime: 90, sell: 1400, color: '#cc2233', accent: '#ee4455', bloomColor: '#ff6699', icon: '🍒', unlock: 25000, multiHarvest: 3 },
            pomegranate: { name: 'Pomegranate', cost: 1500, growTime: 120, sell: 2800, color: '#cc4422', accent: '#dd6655', bloomColor: '#ff8844', icon: '🍈', unlock: 40000, multiHarvest: 3 },
            
            // Category B: Vegetables
            tomato: { name: 'Tomato', cost: 30, growTime: 20, sell: 50, color: '#cc3322', accent: '#ee5544', bloomColor: '#cc2211', icon: '🍅', unlock: 10000, type: 'vegetable' },
            carrot: { name: 'Carrot', cost: 40, growTime: 25, sell: 70, color: '#dd7722', accent: '#ee9955', bloomColor: '#cc5511', icon: '🥕', unlock: 12000, type: 'vegetable' },
            eggplant: { name: 'Eggplant', cost: 70, growTime: 35, sell: 120, color: '#6633aa', accent: '#8855cc', bloomColor: '#552288', icon: '🍆', unlock: 15000, type: 'vegetable' },
            
            // Category C: Herbs & Flowers
            lavender: { name: 'Lavender', cost: 100, growTime: 45, sell: 160, color: '#9966cc', accent: '#bb88dd', bloomColor: '#7744aa', icon: '💜', unlock: 8000, type: 'herb' },
            jasmine: { name: 'Jasmine', cost: 250, growTime: 80, sell: 420, color: '#ffccff', accent: '#ffddee', bloomColor: '#ffbbdd', icon: '🌸', unlock: 18000, type: 'herb' },
            lotus: { name: 'Lotus', cost: 600, growTime: 100, sell: 1100, color: '#ff99cc', accent: '#ffbbdd', bloomColor: '#ee88bb', icon: '🪷', unlock: 30000, type: 'herb' },
            
            // Category D: Exotic/Rare
            nightbloom: { name: 'Night Bloom', cost: 2000, growTime: 150, sell: 4000, color: '#ff44aa', accent: '#ff77cc', bloomColor: '#cc2288', icon: '🌺', unlock: 50000, nightBonus: 2 },
            dragon: { name: 'Dragon Tree', cost: 5000, growTime: 200, sell: 12000, color: '#22aa44', accent: '#44cc66', bloomColor: '#118833', icon: '🐉', unlock: 80000, max: 1 },
            
            // Category E: Tropical Plants
            pineapple: { name: 'Pineapple', cost: 400, growTime: 50, sell: 700, color: '#aa8800', accent: '#ccaa11', bloomColor: '#886600', icon: '🍍', unlock: 30000, multiHarvest: 2 },
            banana: { name: 'Banana', cost: 600, growTime: 70, sell: 1100, color: '#ddcc00', accent: '#ffee11', bloomColor: '#ccaa00', icon: '🍌', unlock: 40000, multiHarvest: 4 },
            mango: { name: 'Mango', cost: 1000, growTime: 90, sell: 1800, color: '#dd8800', accent: '#eeaa22', bloomColor: '#cc6600', icon: '🥭', unlock: 60000, tropical: 1.25 },
            coconut: { name: 'Coconut', cost: 1800, growTime: 120, sell: 3200, color: '#5a4a30', accent: '#7a6a50', bloomColor: '#4a3a20', icon: '🥥', unlock: 80000, weatherProof: true },
            
            // Category F: Farm Crops
            corn: { name: 'Corn', cost: 25, growTime: 15, sell: 40, color: '#ddaa00', accent: '#eecc22', bloomColor: '#cc8800', icon: '🌽', unlock: 25000, multiHarvest: 3 },
            wheat: { name: 'Wheat', cost: 35, growTime: 20, sell: 55, color: '#ccaa33', accent: '#ddcc44', bloomColor: '#aa8822', icon: '🌾', unlock: 30000, multiHarvest: 3 },
            potato: { name: 'Potato', cost: 20, growTime: 18, sell: 35, color: '#8a6a40', accent: '#aa8a60', bloomColor: '#6a4a20', icon: '🥔', unlock: 20000, multiHarvest: 2 },
            sweetpotato: { name: 'Sweet Potato', cost: 50, growTime: 30, sell: 90, color: '#aa6633', accent: '#cc7744', bloomColor: '#884422', icon: '🍠', unlock: 35000, nightBonus: 1.25 },
            
            // Category G: Legendary/Mythical
            phoenix: { name: 'Phoenix', cost: 3000, growTime: 100, sell: 6000, color: '#ff6622', accent: '#ff8844', bloomColor: '#dd4411', icon: '🔥', unlock: 100000, respawn: 30 },
            spiritblossom: { name: 'Spirit Blossom', cost: 5000, growTime: 180, sell: 10000, color: '#ff88ff', accent: '#ffaaff', bloomColor: '#dd66dd', icon: '🌸', unlock: 150000, spiritBonus: 1.5 },
            worldroot: { name: 'World Root', cost: 10000, growTime: 250, sell: 30000, color: '#44aa44', accent: '#66cc66', bloomColor: '#228822', icon: '🎇', unlock: 200000, max: 1, globalBonus: 0.1 },
        };
        this.PLANT_KEYS = Object.keys(this.PLANTS);
        this.selectedSeed = null;

        // Inventory
        this.inventory = [];
        this.inventoryValue = 0;

        // Event system
        this.activeEvent = null;
        this.eventEndTime = 0;
        this.eventTimer = 0;
        this.eventCheckInterval = 5;
        this.EVENTS = {
            rain: { name: 'Rain', icon: '🌧️', desc: 'Plants grow 2x faster!', duration: 30, color: '#5577aa' },
            sale: { name: 'Flash Sale', icon: '🏷️', desc: 'Seeds are 30% off!', duration: 45, color: '#d4af37' },
            bugs: { name: 'Infestation', icon: '🐛', desc: 'A random plant dies every 5s!', duration: 25, color: '#8b0000' },
            crowd: { name: 'Customer Rush', icon: '👥', desc: 'Sell value 2x!', duration: 35, color: '#6b8e23' },
            bonus: { name: 'Bonus', icon: '✨', desc: 'Bonus cash!', duration: 0, color: '#d4af37' },
        };
        this.bugTimer = 0;

        // Upgrade system
        this.UPGRADES = [
            { level: 1, cost: 0, desc: '3 basic plants' },
            { level: 2, cost: 200, desc: 'Orchid unlocked' },
            { level: 3, cost: 500, desc: 'Daisy unlocked' },
            { level: 4, cost: 1000, desc: 'Cactus unlocked' },
            { level: 5, cost: 2000, desc: 'Bonsai unlocked & Fertilizer' },
            { level: 6, cost: 3000, desc: 'Flytrap unlocked' },
            { level: 7, cost: 5000, desc: 'Crystal unlocked & Gold Water' },
            { level: 8, cost: 8000, desc: 'Mushroom & Bug Repellent' },
            { level: 9, cost: 15000, desc: 'Auto-Harvester unlocked' },
            { level: 10, cost: 20000, desc: 'Yggdrasil unlocked' },
        ];
        this.fertilizerActive = false;
        this.goldenWater = false;

        // Visual effects
        this.particles = [];
        this.floatingTexts = [];
        this.time = 0;
        this.harvestGlow = [];

        // Error shake
        this.errorShake = 0;
        this.errorShakeX = 0;

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

        // Button areas
        this._sellBtnArea = null;
        this._quitBtnArea = null;

        // Theme palette (Botanical)
        this.PAL = {
            bg: '#0d140e',
            bgAlt: '#111a12',
            wood: '#3d2b1f',
            woodLight: '#5c3d2e',
            woodDark: '#2a1c14',
            gold: '#d4af37',
            goldDim: '#9a7d28',
            ivory: '#f5f0e0',
            sage: '#b2ac88',
            olive: '#6b8e23',
            soil: '#3a2a1a',
            soilLight: '#4d3928',
            soilDark: '#261a0e',
            terracotta: '#c0623a',
            terracottaDark: '#8e4528',
            oxblood: '#8b0000',
            parchment: '#e8dcc8',
            textMain: '#f5f0e0',
            textDim: '#8a7e68',
            textMuted: '#5a5040',
            green: '#4a7a38',
            greenDark: '#2d5520',
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.money = 10;
        this.displayMoney = 10;
        this.moneyPulse = 1.0;
        this.gameOver = false;
        this.selectedSeed = null;
        this.inventory = [];
        this.inventoryValue = 0;
        this.activeEvent = null;
        this.eventEndTime = 0;
        this.eventTimer = 0;
        this.bugTimer = 0;
        this.particles = [];
        this.bgParticles = [];
        this.floatingTexts = [];
        this.time = 0;
        this.shopScrollY = 0;
        this.fertilizerActive = false;
        this.goldenWater = false;
        this.mouseX = -100;
        this.mouseY = -100;
        this.errorShake = 0;
        this.errorShakeX = 0;
        this.bugRepellent = false;
        this.autoHarvester = false;
        this.dayRatio = 1.0;

        // Layout calculations with safe area
        const L = this.LAYOUT;
        this.shopX = 0;
        this.shopWidth = L.SHOP_W;
        const gridTotalW = L.GRID_SIZE * (L.CELL_SIZE + L.CELL_PAD) - L.CELL_PAD;
        const gridTotalH = gridTotalW;
        const availW = canvas.width - L.SHOP_W - 20;
        const availH = canvas.height - L.TOP_BAR_H - L.BOTTOM_BAR_H - 20;
        this.gardenOffsetX = L.SHOP_W + 10 + Math.floor((availW - gridTotalW) / 2);
        this.gardenOffsetY = L.TOP_BAR_H + 10 + Math.floor((availH - gridTotalH) / 2);

        // Initialize grid
        this.grid = [];
        for (let r = 0; r < L.GRID_SIZE; r++) {
            this.grid[r] = [];
            for (let c = 0; c < L.GRID_SIZE; c++) {
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
        this._updateCursor();
    }

    _updateCursor() {
        const x = this.mouseX;
        const y = this.mouseY;
        let cursor = 'default';

        // Check buttons
        if (this._sellBtnArea && x >= this._sellBtnArea.x && x <= this._sellBtnArea.x + this._sellBtnArea.w &&
            y >= this._sellBtnArea.y && y <= this._sellBtnArea.y + this._sellBtnArea.h && this.inventory.length > 0) {
            cursor = 'pointer';
        } else if (this._quitBtnArea && x >= this._quitBtnArea.x && x <= this._quitBtnArea.x + this._quitBtnArea.w &&
            y >= this._quitBtnArea.y && y <= this._quitBtnArea.y + this._quitBtnArea.h) {
            cursor = 'pointer';
        }

        // Check shop
        if (x >= this.shopX && x <= this.shopX + this.shopWidth && y > this.LAYOUT.TOP_BAR_H + 45 && y < this.canvas.height - this.LAYOUT.BOTTOM_BAR_H) {
            const startY = this.LAYOUT.TOP_BAR_H + 52 - this.shopScrollY;
            const itemHeight = 62;
            let idx = 0;
            for (const key of this.PLANT_KEYS) {
                const plant = this.PLANTS[key];
                const itemY = startY + idx * itemHeight;
                if (y >= itemY && y < itemY + itemHeight - 6) {
                    if (this.score >= plant.unlock) cursor = 'pointer';
                    break;
                }
                idx++;
            }
        }

        // Check grid
        const gridTotalSize = this.GRID_SIZE * (this.CELL_SIZE + this.GRID_PADDING) - this.GRID_PADDING;
        const relX = x - this.gardenOffsetX;
        const relY = y - this.gardenOffsetY;
        if (relX >= 0 && relY >= 0 && relX <= gridTotalSize && relY <= gridTotalSize) {
            const c = Math.floor(relX / (this.CELL_SIZE + this.GRID_PADDING));
            const r = Math.floor(relY / (this.CELL_SIZE + this.GRID_PADDING));
            if (r >= 0 && r < this.unlockedSize && c >= 0 && c < this.unlockedSize) {
                const cell = this.grid[r][c];
                if (cell && cell.ready) cursor = 'grab';
                else if (!cell && this.selectedSeed) cursor = 'copy';
            }
        }

        if (this.canvas.style.cursor !== cursor) {
            this.canvas.style.cursor = cursor;
        }
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
        if (x >= this.shopX && x <= this.shopX + this.shopWidth && y > this.LAYOUT.TOP_BAR_H + 45) {
            // Check expansion buttons if present (added to drawing logic later)
            if (this._expansionBtnArea) {
                const b = this._expansionBtnArea;
                if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                    this._buyExpansion();
                    return;
                }
            }
            this._handleShopClick(x, y);
            return;
        }

        // Check garden grid
        this._handleGridClick(x, y);
    }

    _handleShopClick(x, y) {
        const L = this.LAYOUT;
        const startY = L.TOP_BAR_H + 52 - this.shopScrollY;
        const itemHeight = 68; // Increased from 62 to address "iç içe" crowding
        let idx = 0;

        for (const key of this.PLANT_KEYS) {
            const plant = this.PLANTS[key];
            const itemY = startY + idx * itemHeight;
            const isUnlocked = this.score >= plant.unlock;

            if (y >= itemY && y < itemY + itemHeight && isUnlocked) {
                if (this.selectedSeed === key) {
                    this.selectedSeed = null; // DESELECT
                    if (window.soundManager) window.soundManager.playClick();
                    this._updateCursor();
                    return;
                }
                const cost = this._getPlantCost(key);
                if (this.money >= cost) {
                    this.selectedSeed = key;
                    if (window.soundManager) window.soundManager.playClick();
                } else {
                    // Error: can't afford
                    this.errorShake = 0.3;
                    if (window.soundManager) window.soundManager.playBuzz();
                }
                this._updateCursor();
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

        if (r < 0 || r >= this.unlockedSize || c < 0 || c >= this.unlockedSize) return;

        const cell = this.grid[r][c];

        if (cell === null && this.selectedSeed) {
            const plant = this.PLANTS[this.selectedSeed];
            const cost = this._getPlantCost(this.selectedSeed);
            
            // Dragon Tree: max 1 allowed
            if (plant.max === 1) {
                const existingDragons = this.grid.flat().filter(p => p && p.type === 'dragon').length;
                if (existingDragons >= 1) {
                    this.errorShake = 0.3;
                    this._addFloatingText('Only 1 Dragon Tree!', this.mouseX, this.mouseY, '#ff4444');
                    if (window.soundManager) window.soundManager.playBuzz();
                    return;
                }
            }
            
            if (this.money >= cost) {
                this.money -= cost;
                this.grid[r][c] = {
                    type: this.selectedSeed,
                    plantedAt: Date.now(),
                    ready: false,
                    growthOffset: 0,
                    hasBug: false,
                    bugTimer: 0
                };
                if (window.soundManager) window.soundManager.playPlace();

                // Soil burst particles
                const cellX = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                const cellY = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                this._spawnParticles(cellX, cellY, this.PAL.soil, 8);
                this._spawnParticles(cellX, cellY, this.PAL.soilLight, 4);
            } else {
                this.errorShake = 0.3;
                if (window.soundManager) window.soundManager.playBuzz();
            }
        } else if (cell) {
            if (cell.hasBug) {
                // SQUASH BUG
                cell.hasBug = false;
                const cx = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                const cy = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                this._addFloatingText('SQUASH!', cx, cy, '#ff5555');
                this._spawnParticles(cx, cy, '#ff5555', 5);
                if (window.soundManager) window.soundManager.playClick();
            } else if (cell.ready) {
                this._harvestPlant(r, c);
            }
        }
    }

    _harvestPlant(r, c) {
        const cell = this.grid[r][c];
        if (!cell || !cell.ready) return;

        const plant = this.PLANTS[cell.type];
        let sellPrice = Math.floor(plant.sell * this.levelMultiplier);
        
        // Global bonus from World Root
        if (plant.globalBonus) {
            // Already applied at global level, check for worldroot presence
            const hasWorldRoot = this.grid.flat().some(p => p && p.type === 'worldroot');
            if (hasWorldRoot) {
                sellPrice = Math.floor(sellPrice * 1.1);
            }
        }
        
        // Mushroom night bonus
        if (cell.type === 'mushroom' && this.dayRatio < 0.3) {
            sellPrice = Math.floor(sellPrice * 1.5);
        }
        
        // Night Bloom night bonus
        if (plant.nightBonus && this.dayRatio < 0.4) {
            sellPrice = Math.floor(sellPrice * plant.nightBonus);
        }
        
        // Sweet Potato night bonus
        if (cell.type === 'sweetpotato' && this.dayRatio < 0.35) {
            sellPrice = Math.floor(sellPrice * plant.nightBonus);
        }
        
        // Spirit Blossom bonus
        if (plant.spiritBonus) {
            sellPrice = Math.floor(sellPrice * plant.spiritBonus);
        }
        
        // Tropical bonus (Mango)
        if (plant.tropical) {
            sellPrice = Math.floor(sellPrice * plant.tropical);
        }
        
        // Multi-harvest plants: regrow after harvest
        if (plant.multiHarvest) {
            cell.harvestCount = (cell.harvestCount || 0) + 1;
            if (cell.harvestCount < plant.multiHarvest) {
                // Regenerate plant, doesn't die
                cell.plantedAt = Date.now();
                cell.ready = false;
                cell.growthOffset = plant.growTime * 0.7; // Grows back faster
                sellPrice = Math.floor(sellPrice * (0.5 + cell.harvestCount * 0.25)); // Each harvest gives more
                if (window.soundManager) window.soundManager.playScore();
                this._addFloatingText(`Regrowing! (${cell.harvestCount}/${plant.multiHarvest})`, this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2, this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING), this.PAL.green);
            } else {
                // Final harvest - plant dies or respawns
                if (plant.respawn) {
                    // Phoenix respawns
                    cell.plantedAt = Date.now() + plant.respawn * 1000;
                    cell.ready = false;
                    cell.growthOffset = 0;
                    cell.harvestCount = 0;
                    if (window.soundManager) window.soundManager.playScore();
                    this._addFloatingText(`🔥 Rebirth in ${plant.respawn}s...`, this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2, this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING), '#ff6622');
                } else {
                    this.grid[r][c] = null;
                    if (window.soundManager) window.soundManager.playDing();
                }
            }
        } else {
            // Check for respawn plants (Phoenix)
            if (plant.respawn) {
                cell.plantedAt = Date.now() + plant.respawn * 1000;
                cell.ready = false;
                cell.growthOffset = 0;
                cell.harvestCount = 0;
                if (window.soundManager) window.soundManager.playScore();
                this._addFloatingText(`🔥 Rebirth in ${plant.respawn}s...`, this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2, this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING), '#ff6622');
            } else {
                this.grid[r][c] = null;
                if (window.soundManager) window.soundManager.playDing();
            }
        }
        
        if (this.activeEvent === 'crowd') sellPrice *= 2;

        this.inventory.push({ type: cell.type, sellPrice });
        this._recalcInventoryValue();

        // Grant XP
        const xpGain = Math.floor(sellPrice / 2);
        this.xp += xpGain;
        this._checkLevelUp();

        // Harvest: gold pollen burst
        const cellX = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
        const cellY = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
        this._spawnParticles(cellX, cellY, this.PAL.gold, 10);
        this._spawnParticles(cellX, cellY, plant.color, 6);
        this._addFloatingText(`+${plant.icon}`, cellX, cellY, this.PAL.gold);

        if (window.soundManager) window.soundManager.playDing();

        // Achievement tracking integration
        if (window.gameManager) {
            window.gameManager.checkAchievements('gardenempire', this.score);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UPDATE LOOP
    // ═══════════════════════════════════════════════════════════════════════════

    update(dt) {
        if (this.gameOver) return;
        this.time += dt;

        // Money ticker interpolation
        const diff = this.money - this.displayMoney;
        if (Math.abs(diff) < 0.5) {
            this.displayMoney = this.money;
            this.moneyPulse += (1.0 - this.moneyPulse) * 10 * dt;
        } else {
            this.displayMoney += diff * 10 * dt;
            this.moneyPulse = 1.0 + Math.abs(diff / 200); // Scale pulse based on gain
            if (this.moneyPulse > 1.3) this.moneyPulse = 1.3;
        }

        // Error shake decay
        if (this.errorShake > 0) {
            this.errorShake -= dt;
            this.errorShakeX = (Math.random() - 0.5) * 6 * this.errorShake;
            if (this.errorShake <= 0) {
                this.errorShake = 0;
                this.errorShakeX = 0;
            }
        }

        // Plant growth
        const now = Date.now();
        let growthMultiplier = 1;
        if (this.activeEvent === 'rain') growthMultiplier = 2;
        if (this.fertilizerActive) growthMultiplier *= 1.5;

        // Day/night progress
        const dayDuration = 60; // 60 seconds full cycle
        this.dayRatio = (Math.sin(this.time * Math.PI * 2 / dayDuration) + 1) / 2; // 0.0 to 1.0

        for (let r = 0; r < this.GRID_SIZE; r++) {
            for (let c = 0; c < this.GRID_SIZE; c++) {
                const cell = this.grid[r][c];
                if (cell) {
                    // Update bug death timer
                    if (cell.hasBug) {
                        cell.bugTimer -= dt;
                        if (cell.bugTimer <= 0) {
                            // KILL PLANT
                            const cx = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                            const cy = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                            this._spawnParticles(cx, cy, this.PAL.oxblood, 8);
                            this.grid[r][c] = null;
                            if (window.soundManager) window.soundManager.playDeath();
                            continue;
                        }
                    }

                    if (!cell.ready) {
                        const plant = this.PLANTS[cell.type];
                        // Flytrap grows faster when night, Mushroom grows faster when night
                        let plantGrowthMult = growthMultiplier;
                        if (cell.type === 'mushroom' && this.dayRatio < 0.4) plantGrowthMult *= 2.0;

                        const totalGrowth = ((now - cell.plantedAt) / 1000) * plantGrowthMult + cell.growthOffset;
                        if (totalGrowth >= plant.growTime && !cell.ready) {
                            cell.ready = true;
                            const cx = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                            const cy = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
                            this._spawnParticles(cx, cy, this.PAL.gold, 8);
                            
                            // Auto-harvester
                            if (this.autoHarvester) {
                                this._harvestPlant(r, c);
                            }
                        }
                    }
                }
            }
        }

        // Events
        this.eventTimer += dt;
        if (this.eventTimer >= this.eventCheckInterval) {
            this.eventTimer = 0;
            if (!this.activeEvent) {
                this._tryTriggerEvent();
            }
        }

        if (this.activeEvent && this.activeEvent !== 'bonus') {
            if (Date.now() >= this.eventEndTime) {
                this.activeEvent = null;
            }
        }

        // Bug event
        if (this.activeEvent === 'bugs') {
            this.bugTimer += dt;
            const threshold = this.bugRepellent ? 8 : 4;
            if (this.bugTimer >= threshold) {
                this.bugTimer = 0;
                this._infestRandomPlant();
            }
        }

        // Upgrades
        if (this.score >= 2000 && !this.fertilizerActive) {
            this.fertilizerActive = true;
            this._addFloatingText('🧪 Fertilizer Active!', this.canvas.width / 2, 100, this.PAL.olive);
        }
        if (this.score >= 5000 && !this.goldenWater) {
            this.goldenWater = true;
            this._addFloatingText('✨ Golden Watering!', this.canvas.width / 2, 100, this.PAL.gold);
        }
        if (this.score >= 8000 && !this.bugRepellent) {
            this.bugRepellent = true;
            this._addFloatingText('🛡️ Bug Repellent Active!', this.canvas.width / 2, 100, this.PAL.sage);
        }
        if (this.score >= 15000 && !this.autoHarvester) {
            this.autoHarvester = true;
            this._addFloatingText('🚜 Auto-Harvester Active!', this.canvas.width / 2, 100, this.PAL.olive);
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 80 * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Drifting background pollen
        if (this.bgParticles.length < 35 && Math.random() < 0.08) {
            this.bgParticles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                vx: (Math.random() - 0.5) * 20,
                vy: -Math.random() * 15 - 10,
                size: Math.random() * 1.5 + 0.5,
                life: 1.0,
                pulse: Math.random() * Math.PI * 2
            });
        }
        for (let i = this.bgParticles.length - 1; i >= 0; i--) {
            const p = this.bgParticles[i];
            p.y += p.vy * dt;
            p.x += (p.vx + Math.sin(this.time + p.pulse) * 10) * dt;
            if (p.y < -10) this.bgParticles.splice(i, 1);
        }

        // Floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= 35 * dt;
            ft.life -= dt;
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DRAWING
    // ═══════════════════════════════════════════════════════════════════════════

    draw() {
        const { ctx, canvas } = this;
        const P = this.PAL;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Deep forest background - Day/Night Cycle
        const dR = this.dayRatio;
        const tp = [Math.floor(5 + 8*dR), Math.floor(10 + 10*dR), Math.floor(25 - 11*dR)];
        const bp = [Math.floor(2 + 6*dR), Math.floor(5 + 9*dR), Math.floor(12 - 4*dR)];
        
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, `rgb(${tp[0]}, ${tp[1]}, ${tp[2]})`);
        bgGrad.addColorStop(1, `rgb(${bp[0]}, ${bp[1]}, ${bp[2]})`);
        
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Organic pattern: subtle leaf-like diamond grid
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.strokeStyle = P.olive;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < canvas.width; i += 35) {
            for (let j = 0; j < canvas.height; j += 35) {
                if ((Math.floor(i / 35) + Math.floor(j / 35)) % 2 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(i + 17, j);
                    ctx.lineTo(i + 35, j + 17);
                    ctx.lineTo(i + 17, j + 35);
                    ctx.lineTo(i, j + 17);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
        ctx.restore();

        // Event background tint
        if (this.activeEvent && this.EVENTS[this.activeEvent]) {
            ctx.save();
            ctx.globalAlpha = 0.04;
            ctx.fillStyle = this.EVENTS[this.activeEvent].color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        this._drawTopBar();
        this._drawShop();
        this._drawGarden();
        this._drawBottomBar();
        this._drawEventBanner();
        this._drawBgParticles(); // Drifting pollen
        this._drawParticles();
        this._drawFloatingTexts();
        this._drawSeedGhost();
        this._drawRain();
    }

    _drawBgParticles() {
        const { ctx } = this;
        ctx.save();
        this.bgParticles.forEach(p => {
            ctx.globalAlpha = 0.15 * (1.0 + Math.sin(this.time * 2 + p.pulse) * 0.5);
            ctx.fillStyle = this.PAL.ivory;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    _drawRain() {
        if (this.activeEvent !== 'rain') return;
        const { ctx, canvas } = this;
        ctx.save();
        ctx.strokeStyle = '#5c88c8';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
        const spacing = 40;
        const timeOffset = (this.time * 800) % 500;

        for (let x = 0; x < canvas.width; x += spacing) {
            for (let y = -50; y < canvas.height; y += 150) {
                const ry = y + timeOffset;
                const rx = x + (Math.sin(ry * 0.01) * 10);
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx + 2, ry + 25);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    _drawSeedGhost() {
        if (!this.selectedSeed || this.mouseX < 0 || this.mouseY < 0) return;
        const plant = this.PLANTS[this.selectedSeed];
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plant.icon, this.mouseX + 15, this.mouseY + 15);
        ctx.restore();
    }

    // ─── Wooden Panel Helper ─────────────────────────────────────────────────

    _drawWoodPanel(x, y, w, h, radius) {
        const { ctx } = this;
        const P = this.PAL;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius || 0);
        const woodGrad = ctx.createLinearGradient(x, y, x, y + h);
        woodGrad.addColorStop(0, P.woodLight);
        woodGrad.addColorStop(0.3, P.wood);
        woodGrad.addColorStop(1, P.woodDark);
        ctx.fillStyle = woodGrad;
        ctx.fill();

        // Subtle grain lines
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = '#000000';
        for (let i = y + 4; i < y + h - 2; i += 6) {
            ctx.beginPath();
            ctx.moveTo(x + 2, i + Math.sin(i * 0.3) * 1.5);
            ctx.lineTo(x + w - 2, i + Math.cos(i * 0.2) * 1.5);
            ctx.stroke();
        }
        ctx.restore();
    }

    // ─── Top Bar ─────────────────────────────────────────────────────────────

    _drawTopBar() {
        const { ctx, canvas } = this;
        const P = this.PAL;
        const barH = this.LAYOUT.TOP_BAR_H;

        // Wooden shelf
        this._drawWoodPanel(0, 0, canvas.width, barH, 0);

        // Bottom brass trim
        const trimGrad = ctx.createLinearGradient(0, barH - 3, canvas.width, barH - 3);
        trimGrad.addColorStop(0, 'rgba(180, 145, 50, 0.1)');
        trimGrad.addColorStop(0.3, P.gold);
        trimGrad.addColorStop(0.5, '#e8c850');
        trimGrad.addColorStop(0.7, P.gold);
        trimGrad.addColorStop(1, 'rgba(180, 145, 50, 0.1)');
        ctx.fillStyle = trimGrad;
        ctx.fillRect(0, barH - 3, canvas.width, 3);

        // Money display with ticker
        const isTickingUp = this.displayMoney < this.money - 0.5;
        const isTickingDown = this.displayMoney > this.money + 0.5;
        let moneyColor = P.gold;
        let moneyX = 22 + this.errorShakeX;
        let moneyY = barH / 2;

        if (isTickingDown) {
            moneyColor = P.oxblood;
            moneyX += (Math.random() - 0.5) * 3;
            moneyY += (Math.random() - 0.5) * 2;
        } else if (isTickingUp) {
            moneyColor = P.olive;
            moneyY -= 1;
        }

        ctx.save();
        ctx.translate(moneyX, moneyY);
        ctx.scale(this.moneyPulse, this.moneyPulse);
        ctx.fillStyle = moneyColor;
        ctx.font = '800 22px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`💰 $${Math.floor(this.displayMoney)}`, 0, 0);
        ctx.restore();

        // Title
        ctx.save();
        ctx.font = '900 18px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = P.ivory;
        ctx.fillText('G A R D E N   E M P I R E', canvas.width / 2 + 30, barH / 2 - 12);

        ctx.fillStyle = P.textDim;
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillText(`TOTAL REVENUE: $${Math.floor(this.score)} | LEVEL ${this.level}`, canvas.width / 2 + 30, barH / 2 + 6);

        // XP Bar
        const xpBarW = 120;
        const xpBarH = 4;
        const xpBarX = canvas.width / 2 + 30 - xpBarW / 2;
        const xpBarY = barH / 2 + 16;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH);
        const xpProgress = Math.min(1, this.xp / this.xpToNextLevel);
        ctx.fillStyle = P.gold;
        ctx.fillRect(xpBarX, xpBarY, xpBarW * xpProgress, xpBarH);
        ctx.restore();

        // Quit button (wooden sign style)
        const quitW = 75;
        const quitH = 28;
        const quitX = canvas.width - quitW - 15;
        const quitY = (barH - quitH) / 2;
        this._quitBtnArea = { x: quitX, y: quitY, w: quitW, h: quitH };

        const isHover = (this.mouseX >= quitX && this.mouseX <= quitX + quitW &&
            this.mouseY >= quitY && this.mouseY <= quitY + quitH);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(quitX, quitY, quitW, quitH, 5);
        ctx.fillStyle = isHover ? 'rgba(139, 0, 0, 0.4)' : 'rgba(139, 0, 0, 0.2)';
        ctx.fill();
        ctx.strokeStyle = isHover ? P.oxblood : 'rgba(139, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = isHover ? '#ff9999' : '#cc8888';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EXIT ✕', quitX + quitW / 2, quitY + quitH / 2);
        ctx.restore();
    }

    // ─── Shop (Seed Shed) ────────────────────────────────────────────────────

    _drawShop() {
        const { ctx, canvas } = this;
        const P = this.PAL;
        const L = this.LAYOUT;
        const shopY = L.TOP_BAR_H;
        const shopBottom = canvas.height - L.BOTTOM_BAR_H;
        const shopH = shopBottom - shopY;

        // Wooden panel background
        this._drawWoodPanel(this.shopX, shopY, this.shopWidth, shopH, 0);

        // Right edge brass trim
        ctx.fillStyle = P.goldDim;
        ctx.fillRect(this.shopWidth - 2, shopY, 2, shopH);

        // Title plaque
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(15, shopY + 8, this.shopWidth - 30, 26, 4);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        ctx.strokeStyle = P.goldDim;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = P.gold;
        ctx.font = '800 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌱 SEED SHOP', this.shopWidth / 2, shopY + 21);
        ctx.restore();

        // Separator
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.fillRect(10, shopY + 40, this.shopWidth - 20, 1);

        // Clip region for scrolling items
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.shopX, shopY + 42, this.shopWidth, shopH - 82);
        ctx.clip();

        const itemHeight = 68; // Increased from 62
        const startY = shopY + 48 - this.shopScrollY;
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
                    this.mouseY >= iy && this.mouseY <= iy + itemHeight - 6);

            // Seed packet card
            ctx.beginPath();
            ctx.roundRect(this.shopX + 8, iy, this.shopWidth - 16, itemHeight - 6, 6);

            if (isSelected) {
                ctx.fillStyle = 'rgba(107, 142, 35, 0.2)';
            } else if (isHover) {
                ctx.fillStyle = 'rgba(245, 240, 224, 0.08)';
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            }
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = P.olive;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Selection glow
                ctx.save();
                ctx.globalAlpha = 0.2 + Math.sin(this.time * 5) * 0.1;
                ctx.shadowBlur = 10;
                ctx.shadowColor = P.gold;
                ctx.stroke();
                ctx.restore();
            } else if (isHover) {
                ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            if (!isUnlocked) {
                // Locked: twine-wrapped appearance
                ctx.fillStyle = 'rgba(10, 8, 5, 0.75)';
                ctx.fill();

                ctx.fillStyle = '#cc8866';
                ctx.font = '700 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔒', this.shopWidth / 2, iy + 18);

                ctx.fillStyle = P.textDim;
                ctx.font = '600 9px Inter, sans-serif';
                ctx.fillText(`UNLOCK: $${plant.unlock}`, this.shopWidth / 2, iy + 34);

                const needed = plant.unlock - this.score;
                ctx.fillStyle = P.textMuted;
                ctx.font = '500 8px Inter, sans-serif';
                ctx.fillText(`${needed} $ to go`, this.shopWidth / 2, iy + 46);
            } else {
                // Plant icon
                ctx.font = '22px serif';
                ctx.textAlign = 'left';
                ctx.fillText(plant.icon, this.shopX + 16, iy + 24);

                // Plant name
                ctx.fillStyle = canAfford ? P.ivory : P.textDim;
                ctx.font = '700 12px Inter, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(plant.name, this.shopX + 46, iy + 16);

                // Cost (gold plate)
                ctx.fillStyle = canAfford ? P.gold : P.oxblood;
                ctx.font = '800 11px Inter, sans-serif';
                ctx.fillText(`$${cost}`, this.shopX + 46, iy + 31);

                // Stats
                ctx.fillStyle = P.textDim;
                ctx.font = '500 9px Inter, sans-serif';
                ctx.fillText(`⏱ ${plant.growTime}s`, this.shopX + 46, iy + 46);

                const sellVal = this.activeEvent === 'crowd' ? plant.sell * 2 : plant.sell;
                ctx.fillStyle = P.olive;
                ctx.fillText(`💰$${sellVal}`, this.shopX + 100, iy + 46);

                // Profit Display
                const profit = sellVal - cost;
                ctx.fillStyle = profit > 0 ? P.green : P.oxblood;
                ctx.font = 'italic 700 9px Inter, sans-serif';
                ctx.fillText(`Profit: +$${profit}`, this.shopX + 132, iy + 31);

                // Selected indicator: brass dot
                if (isSelected) {
                    const dotPulse = 0.5 + Math.sin(this.time * 4) * 0.3;
                    ctx.fillStyle = `rgba(212, 175, 55, ${dotPulse})`;
                    ctx.beginPath();
                    ctx.arc(this.shopWidth - 20, iy + 22, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            idx++;
            totalHeight = idx * itemHeight;
        }

        this.shopMaxScroll = Math.max(0, totalHeight - (shopH - 90));
        ctx.restore();

        // Balance bar at bottom of shop
        const balBarH = 36;
        const balBarY = shopBottom - balBarH;
        ctx.fillStyle = P.woodDark;
        ctx.fillRect(this.shopX, balBarY, this.shopWidth, balBarH);
        ctx.fillStyle = P.goldDim;
        ctx.fillRect(this.shopX, balBarY, this.shopWidth, 1);

        ctx.fillStyle = (this.displayMoney > this.money + 0.5) ? P.oxblood : P.gold;
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`BALANCE: $${Math.floor(this.displayMoney)}`, this.shopWidth / 2, balBarY + balBarH / 2);

        // Expansion Button - Bottom Right Corner (in bottom bar, right side)
        if (this.unlockedSize < 6) {
            const expW = 140;
            const expH = 34;
            const expX = canvas.width - expW - 10;
            const expY = shopBottom - expH - 8;
            this._expansionBtnArea = { x: expX, y: expY, w: expW, h: expH };
            
            const cost = this.unlockedSize === 4 ? 1000 : 5000;
            const isHover = (this.mouseX >= expX && this.mouseX <= expX + expW && this.mouseY >= expY && this.mouseY <= expY + expH);
            
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(expX, expY, expW, expH, 6);
            ctx.fillStyle = isHover ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.15)';
            ctx.fill();
            ctx.strokeStyle = P.gold;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.fillStyle = P.gold;
            ctx.font = '700 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.unlockedSize === 4 ? 'EXPAND (5x5)' : 'EXPAND (6x6)', expX + expW / 2, expY + 14);
            ctx.fillStyle = this.money >= cost ? P.ivory : P.oxblood;
            ctx.font = '800 11px Inter, sans-serif';
            ctx.fillText(`$${cost}`, expX + expW / 2, expY + 28);
            ctx.restore();
        } else {
            this._expansionBtnArea = null;
        }
    }

    // ─── Garden Grid ─────────────────────────────────────────────────────────

    _drawGarden() {
        const { ctx } = this;
        const P = this.PAL;
        const now = Date.now();
        let growthMultiplier = 1;
        if (this.activeEvent === 'rain') growthMultiplier = 2;
        if (this.fertilizerActive) growthMultiplier *= 1.5;

        // Garden border: wooden fence frame
        const gridW = this.GRID_SIZE * (this.CELL_SIZE + this.GRID_PADDING) - this.GRID_PADDING;
        const gridH = gridW;
        const frameX = this.gardenOffsetX - 10;
        const frameY = this.gardenOffsetY - 10;
        const frameW = gridW + 20;
        const frameH = gridH + 20;

        // Outer wooden frame
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameW, frameH, 10);
        ctx.strokeStyle = P.wood;
        ctx.lineWidth = 4;
        ctx.stroke();
        // Inner brass trim
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(frameX + 3, frameY + 3, frameW - 6, frameH - 6, 8);
        ctx.stroke();
        ctx.restore();

        // Draw each cell
        for (let r = 0; r < this.GRID_SIZE; r++) {
            for (let c = 0; c < this.GRID_SIZE; c++) {
                const cellX = this.gardenOffsetX + c * (this.CELL_SIZE + this.GRID_PADDING);
                const cellY = this.gardenOffsetY + r * (this.CELL_SIZE + this.GRID_PADDING);
                const cell = this.grid[r][c];

                // Terracotta pot (top-down view)
                ctx.beginPath();
                ctx.roundRect(cellX, cellY, this.CELL_SIZE, this.CELL_SIZE, 8);

                // Cell Background
                ctx.beginPath();
                ctx.roundRect(cellX, cellY, this.CELL_SIZE, this.CELL_SIZE, 8);
                
                if (r >= this.unlockedSize || c >= this.unlockedSize) {
                    // Locked cell visual
                    ctx.fillStyle = 'rgba(20, 30, 20, 0.8)';
                    ctx.fill();
                    ctx.strokeStyle = '#2a3a2a';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🪨', cellX + this.CELL_SIZE / 2, cellY + this.CELL_SIZE / 2);
                    continue; 
                }

                // Pot rim gradient
                const potGrad = ctx.createLinearGradient(cellX, cellY, cellX, cellY + this.CELL_SIZE);
                potGrad.addColorStop(0, P.terracotta);
                potGrad.addColorStop(0.15, P.terracottaDark);
                potGrad.addColorStop(0.2, P.soilDark);
                potGrad.addColorStop(0.5, P.soil);
                potGrad.addColorStop(1, P.soilDark);
                ctx.fillStyle = potGrad;
                ctx.fill();

                // Pot border
                ctx.strokeStyle = 'rgba(140, 90, 50, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Soil texture dots (procedural noise)
                ctx.save();
                ctx.globalAlpha = 0.15;
                const seed = r * 7 + c * 13;
                for (let d = 0; d < 8; d++) {
                    const dx = ((seed + d * 37) % 48) + cellX + 6;
                    const dy = ((seed + d * 23) % 38) + cellY + 14;
                    ctx.fillStyle = d % 2 === 0 ? '#2a1c10' : '#4a3520';
                    ctx.beginPath();
                    ctx.arc(dx, dy, 1 + (d % 3), 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                // Empty cell hover: sunlight beam effect
                if (cell === null && this.selectedSeed) {
                    const isHover = (this.mouseX >= cellX && this.mouseX <= cellX + this.CELL_SIZE &&
                        this.mouseY >= cellY && this.mouseY <= cellY + this.CELL_SIZE);

                    if (isHover) {
                        // Warm golden glow filling the pot
                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(cellX, cellY, this.CELL_SIZE, this.CELL_SIZE, 8);
                        ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
                        ctx.fill();
                        ctx.strokeStyle = P.gold;
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // Visual hint
                        ctx.fillStyle = P.gold;
                        ctx.font = '700 12px Inter, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('+', cellX + this.CELL_SIZE / 2, cellY + this.CELL_SIZE / 2 + 4);
                        ctx.restore();
                    } else {
                        // Subtle dashed hint
                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(cellX + 4, cellY + 4, this.CELL_SIZE - 8, this.CELL_SIZE - 8, 4);
                        ctx.strokeStyle = 'rgba(107, 142, 35, 0.2)';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([3, 3]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        ctx.restore();
                    }
                }

                if (cell) {
                    const plant = this.PLANTS[cell.type];
                    const totalGrowth = ((now - cell.plantedAt) / 1000) * growthMultiplier + cell.growthOffset;
                    const progress = Math.min(1, totalGrowth / plant.growTime);

                    this._drawPlant(ctx, cellX, cellY, cell, plant, progress);
                    
                    if (cell.hasBug) {
                        const pulse = Math.sin(this.time * 8) * 2;
                        ctx.fillStyle = '#cc0000';
                        ctx.beginPath();
                        ctx.arc(cellX + this.CELL_SIZE - 12, cellY + 12, 6 + pulse, 0, Math.PI * 2);
                        ctx.fill();
                        
                        ctx.fillStyle = P.ivory;
                        ctx.font = '10px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🐛', cellX + this.CELL_SIZE - 12, cellY + 12);
                        
                        ctx.fillStyle = '#cc0000';
                        const w = (this.CELL_SIZE - 8) * (cell.bugTimer / 3.5);
                        ctx.fillRect(cellX + 4, cellY + 2, w, 3);
                    }
                }
            }
        }
    }

    _drawPlant(ctx, cellX, cellY, cell, plant, progress) {
        const centerX = cellX + this.CELL_SIZE / 2;
        const centerY = cellY + this.CELL_SIZE / 2;
        // Wind sway: gentle organic animation
        const windSway = Math.sin(this.time * 1.8 + centerX * 0.05) * 1.5;

        if (progress < 0.25) {
            // Stage 1: Seed
            ctx.fillStyle = '#7a5c2e';
            ctx.beginPath();
            ctx.arc(centerX, centerY + 10, 3 + progress * 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (progress < 0.50) {
            // Stage 2: Sprout
            const stemH = 10 + (progress - 0.25) * 60;
            const stemTopY = centerY + 10 - stemH;

            ctx.strokeStyle = '#4a8a40';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 10);
            ctx.lineTo(centerX + windSway * 0.3, stemTopY + windSway);
            ctx.stroke();

            ctx.fillStyle = '#5cb85c';
            ctx.beginPath();
            ctx.ellipse(centerX - 6 + windSway * 0.3, stemTopY + 5 + windSway, 5, 3, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 6 + windSway * 0.3, stemTopY + 8 + windSway, 5, 3, 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#7a5c2e';
            ctx.beginPath();
            ctx.arc(centerX, centerY + 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (progress < 0.75) {
            // Stage 3: Growing
            const p = (progress - 0.5) / 0.25;
            const stemH = 25 + p * 10;
            const stemTopY = centerY + 10 - stemH;

            ctx.strokeStyle = '#3d7a35';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 10);
            ctx.lineTo(centerX + windSway * 0.5, stemTopY + windSway);
            ctx.stroke();

            ctx.fillStyle = '#4caf50';
            const leafSize = 7 + p * 4;
            ctx.beginPath();
            ctx.ellipse(centerX - 9 + windSway * 0.4, stemTopY + 12 + windSway, leafSize, 4, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 9 + windSway * 0.4, stemTopY + 16 + windSway, leafSize, 4, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX - 5 + windSway * 0.3, stemTopY + 5 + windSway, leafSize - 2, 3, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Bud
            ctx.fillStyle = plant.accent;
            ctx.beginPath();
            ctx.arc(centerX + windSway * 0.5, stemTopY + windSway, 4 + p * 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Stage 4: Full bloom
            const stemH = 32;
            const stemTopY = centerY + 10 - stemH;

            ctx.strokeStyle = '#2d6028';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 10);
            ctx.lineTo(centerX + windSway * 0.6, stemTopY + windSway);
            ctx.stroke();

            ctx.fillStyle = '#388e3c';
            ctx.beginPath();
            ctx.ellipse(centerX - 10 + windSway * 0.5, stemTopY + 18 + windSway, 10, 5, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 10 + windSway * 0.5, stemTopY + 22 + windSway, 10, 5, 0.5, 0, Math.PI * 2);
            ctx.fill();

            // Flower
            this._drawBloom(ctx, centerX + windSway * 0.6, stemTopY + windSway, plant, cell.type);

            // Ready indicator: golden harvest marker
            if (cell.ready) {
                ctx.save();
                const pulse = 0.5 + Math.sin(this.time * 3) * 0.3;
                ctx.strokeStyle = this.PAL.gold;
                ctx.lineWidth = 2;
                ctx.globalAlpha = pulse;
                ctx.beginPath();
                ctx.roundRect(cellX + 2, cellY + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4, 6);
                ctx.stroke();
                ctx.restore();

                // Harvest star
                ctx.fillStyle = this.PAL.gold;
                ctx.font = '700 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✦', cellX + this.CELL_SIZE - 10, cellY + 10);
            }
            
            // Multi-harvest indicator
            if (plant.multiHarvest && cell.harvestCount) {
                ctx.fillStyle = this.PAL.olive;
                ctx.font = '600 8px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${cell.harvestCount}/${plant.multiHarvest}`, cellX + this.CELL_SIZE / 2, cellY + this.CELL_SIZE - 18);
            }
        }

        // Progress bar (natural style)
        if (!cell.ready) {
            const barW = this.CELL_SIZE - 10;
            const barH = 3;
            const barX = cellX + 5;
            const barY = cellY + this.CELL_SIZE - 8;

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = progress < 0.5 ? '#b8860b' : this.PAL.olive;
            ctx.fillRect(barX, barY, barW * progress, barH);
        }
    }

    _drawBloom(ctx, cx, cy, plant, type) {
        ctx.save();

        switch (type) {
            case 'rose':
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.fillStyle = plant.color;
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(angle) * 6,
                        cy + Math.sin(angle) * 6,
                        8, 5, angle, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.fillStyle = '#a84060';
                ctx.beginPath();
                ctx.arc(cx, cy, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'tulip':
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
                for (let i = 0; i < 10; i++) {
                    const angle = (i / 10) * Math.PI * 2;
                    ctx.fillStyle = '#c89820';
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(angle) * 8,
                        cy + Math.sin(angle) * 8,
                        7, 3.5, angle, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.fillStyle = '#442200';
                ctx.beginPath();
                ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#553311';
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'orchid': {
                const angles = [0, 72, 144, 216, 288];
                angles.forEach(deg => {
                    const rad = deg * Math.PI / 180;
                    ctx.fillStyle = plant.color;
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(rad) * 7,
                        cy + Math.sin(rad) * 7,
                        7, 4, rad, 0, Math.PI * 2
                    );
                    ctx.fill();
                });
                ctx.fillStyle = '#c878b0';
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
            }

            case 'smile':
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.fillStyle = '#f0ead0';
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + Math.cos(angle) * 7,
                        cy + Math.sin(angle) * 7,
                        6, 3, angle, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.fillStyle = '#c8a830';
                ctx.beginPath();
                ctx.arc(cx, cy, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'cactus':
                ctx.fillStyle = plant.color;
                ctx.beginPath();
                ctx.roundRect(cx - 6, cy - 12, 12, 20, 6);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(cx - 14, cy - 6, 8, 4, 3);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(cx + 6, cy - 8, 8, 4, 3);
                ctx.fill();
                ctx.fillStyle = '#d08088';
                ctx.beginPath();
                ctx.arc(cx, cy - 14, 4, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'bonsai':
                ctx.fillStyle = '#4a3020';
                ctx.fillRect(cx - 2, cy - 5, 4, 15);
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
                ctx.fillStyle = plant.color;
                ctx.beginPath();
                ctx.moveTo(cx, cy - 16);
                ctx.lineTo(cx + 8, cy - 4);
                ctx.lineTo(cx + 5, cy + 8);
                ctx.lineTo(cx - 5, cy + 8);
                ctx.lineTo(cx - 8, cy - 4);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath();
                ctx.moveTo(cx - 2, cy - 12);
                ctx.lineTo(cx + 4, cy - 4);
                ctx.lineTo(cx + 1, cy + 4);
                ctx.lineTo(cx - 4, cy - 2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'flytrap':
                ctx.fillStyle = plant.color;
                ctx.beginPath();
                ctx.arc(cx - 3, cy, 6, Math.PI, 0);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 3, cy, 6, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = plant.bloomColor;
                ctx.beginPath();
                ctx.arc(cx, cy - 2, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx - 6, cy - 3); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 2, cy - 3); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 4, cy - 3); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx + 6, cy); ctx.lineTo(cx + 8, cy - 3); ctx.stroke();
                break;

            case 'mushroom':
                ctx.fillStyle = '#e8dcc8';
                ctx.fillRect(cx - 3, cy - 8, 6, 12);
                ctx.fillStyle = plant.bloomColor;
                ctx.beginPath();
                ctx.ellipse(cx, cy - 10, 10, 6, 0, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(cx - 4, cy - 12, 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 4, cy - 11, 2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 14, 1.5, 0, Math.PI * 2); ctx.fill();
                break;

            case 'yggdrasil':
                ctx.fillStyle = '#3a2a1a';
                ctx.beginPath();
                ctx.moveTo(cx - 6, cy + 10);
                ctx.lineTo(cx - 4, cy - 15);
                ctx.lineTo(cx + 4, cy - 15);
                ctx.lineTo(cx + 6, cy + 10);
                ctx.fill();
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.arc(cx - 8, cy - 15, 10, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 8, cy - 15, 10, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 25, 12, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = plant.accent;
                ctx.beginPath(); ctx.arc(cx - 4, cy - 20, 6, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 4, cy - 18, 6, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = plant.bloomColor;
                ctx.beginPath(); ctx.arc(cx - 6, cy - 12, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 5, cy - 22, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 8, cy - 10, 3, 0, Math.PI * 2); ctx.fill();
                break;
                
            // === NEW PLANTS Category A: Fruit Trees ===
            case 'apple':
                // Tree trunk
                ctx.fillStyle = '#5a3a1a';
                ctx.fillRect(cx - 3, cy - 2, 6, 16);
                // Foliage
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.arc(cx - 8, cy - 12, 10, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 8, cy - 10, 9, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 18, 10, 0, Math.PI * 2); ctx.fill();
                // Apples (red dots)
                ctx.fillStyle = '#cc2222';
                ctx.beginPath(); ctx.arc(cx - 4, cy - 8, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 6, cy - 12, 3, 0, Math.PI * 2); ctx.fill();
                break;
                
            case 'cherry':
                // Tree trunk
                ctx.fillStyle = '#4a2a10';
                ctx.fillRect(cx - 2, cy - 2, 4, 16);
                // Foliage (pinkish)
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.arc(cx - 6, cy - 14, 9, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 7, cy - 12, 8, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 20, 8, 0, Math.PI * 2); ctx.fill();
                // Cherries (red)
                ctx.fillStyle = '#dd1122';
                ctx.beginPath(); ctx.arc(cx - 2, cy - 6, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 4, cy - 8, 3, 0, Math.PI * 2); ctx.fill();
                break;
                
            case 'pomegranate':
                // Trunk
                ctx.fillStyle = '#4a3020';
                ctx.fillRect(cx - 3, cy - 2, 6, 16);
                // Foliage
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.ellipse(cx, cy - 14, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
                // Fruit
                ctx.fillStyle = '#dd4422';
                ctx.beginPath(); ctx.arc(cx - 4, cy - 12, 5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 5, cy - 10, 4, 0, Math.PI * 2); ctx.fill();
                break;
                
            // === NEW PLANTS Category B: Vegetables ===
            case 'tomato':
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
                // Stem
                ctx.fillStyle = '#338822';
                ctx.fillRect(cx - 2, cy - 14, 4, 6);
                // Shine
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 3, 0, Math.PI * 2); ctx.fill();
                break;
                
            case 'carrot':
                // Leaves
                ctx.fillStyle = '#44aa33';
                ctx.beginPath(); ctx.ellipse(cx - 4, cy - 8, 6, 2, -0.3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx + 4, cy - 8, 6, 2, 0.3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx, cy - 10, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
                // Root
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.moveTo(cx, cy + 2); ctx.lineTo(cx - 5, cy + 14); ctx.lineTo(cx + 5, cy + 14); ctx.closePath(); ctx.fill();
                break;
                
            case 'eggplant':
                // Stem
                ctx.fillStyle = '#44aa33';
                ctx.fillRect(cx - 2, cy - 14, 4, 6);
                // Fruit
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.ellipse(cx, cy - 4, 10, 12, 0, 0, Math.PI * 2); ctx.fill();
                // Calyx
                ctx.fillStyle = '#449922';
                ctx.beginPath(); ctx.moveTo(cx - 6, cy - 10); ctx.lineTo(cx - 3, cy - 14); ctx.lineTo(cx + 3, cy - 14); ctx.lineTo(cx + 6, cy - 10); ctx.closePath(); ctx.fill();
                break;
                
            // === NEW PLANTS Category C: Herbs & Flowers ===
            case 'lavender':
                // Stem
                ctx.strokeStyle = '#556622';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy + 8); ctx.stroke();
                // Flower spikes
                ctx.fillStyle = plant.color;
                for (let i = 0; i < 5; i++) {
                    const sy = cy - 14 + i * 4;
                    ctx.beginPath(); ctx.ellipse(cx, sy, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
                }
                break;
                
            case 'jasmine':
                // Vine
                ctx.strokeStyle = '#226622';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx - 4, cy - 12); ctx.quadraticCurveTo(cx - 6, cy, cx, cy + 10); ctx.stroke();
                // Flowers
                ctx.fillStyle = '#ffddff';
                ctx.beginPath(); ctx.arc(cx - 4, cy - 10, 5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 3, cy - 6, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
                // Center
                ctx.fillStyle = '#ffaa33';
                ctx.beginPath(); ctx.arc(cx - 4, cy - 10, 2, 0, Math.PI * 2); ctx.fill();
                break;
                
            case 'lotus':
                // Flower petals
                ctx.fillStyle = plant.color;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.ellipse(cx + Math.cos(angle) * 4, cy + Math.sin(angle) * 4, 6, 3, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = plant.accent;
                ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
                break;
                
            // === NEW PLANTS Category D: Exotic ===
            case 'nightbloom':
                // Stem
                ctx.fillStyle = '#226644';
                ctx.fillRect(cx - 2, cy - 2, 4, 14);
                // Flower (crown shape)
                ctx.fillStyle = plant.color;
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.ellipse(cx + Math.cos(angle) * 8, cy + Math.sin(angle) * 8, 7, 4, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Center glow
                const glowPulse = 0.5 + Math.sin(this.time * 3) * 0.3;
                ctx.fillStyle = plant.bloomColor;
                ctx.globalAlpha = glowPulse;
                ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
                break;
                
            case 'dragon':
                // Trunk (curved)
                ctx.fillStyle = '#3a2a1a';
                ctx.beginPath();
                ctx.moveTo(cx - 5, cy + 12);
                ctx.quadraticCurveTo(cx - 8, cy, cx - 4, cy - 16);
                ctx.quadraticCurveTo(cx + 2, cy - 20, cx + 6, cy - 14);
                ctx.lineTo(cx + 8, cy - 12);
                ctx.lineTo(cx + 4, cy - 16);
                ctx.quadraticCurveTo(cx - 2, cy - 22, cx - 6, cy - 18);
                ctx.lineTo(cx - 8, cy - 14);
                ctx.quadraticCurveTo(cx - 12, cy, cx - 8, cy + 14);
                ctx.fill();
                // Foliage (multiple clusters)
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.arc(cx - 6, cy - 18, 10, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 6, cy - 14, 9, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 22, 11, 0, Math.PI * 2); ctx.fill();
                // Glowing accents
                ctx.fillStyle = plant.accent;
                for (let i = 0; i < 3; i++) {
                    const gx = cx - 4 + i * 4;
                    const gy = cy - 16 - i * 3;
                    ctx.globalAlpha = 0.5 + Math.sin(this.time * 2 + i) * 0.3;
                    ctx.beginPath(); ctx.arc(gx, gy, 3, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = 1;
                break;
                
            // === Category E: Tropical Plants ===
            case 'pineapple':
                // Leaves
                ctx.fillStyle = '#44aa33';
                for (let i = 0; i < 5; i++) {
                    const angle = -Math.PI / 2 + (i - 2) * 0.3;
                    ctx.beginPath();
                    ctx.ellipse(cx + Math.cos(angle) * 2, cy - 12 + Math.sin(angle) * 4, 8, 3, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Fruit
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.ellipse(cx, cy + 2, 9, 11, 0, 0, Math.PI * 2); ctx.fill();
                // Cross pattern
                ctx.strokeStyle = '#ccaa00';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 8); ctx.stroke();
                break;
                
            case 'banana':
                // Tree trunk
                ctx.fillStyle = '#4a6a20';
                ctx.fillRect(cx - 4, cy - 2, 8, 14);
                // Large leaves
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.ellipse(cx - 8, cy - 8, 10, 3, -0.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx + 8, cy - 6, 10, 3, 0.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx, cy - 12, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
                // Bananas
                ctx.fillStyle = '#ffee00';
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath(); ctx.ellipse(cx - 4 + i * 4, cy + 2, 3, 6, 0.2, 0, Math.PI * 2); ctx.fill();
                }
                break;
                
            case 'mango':
                // Trunk
                ctx.fillStyle = '#4a3a20';
                ctx.fillRect(cx - 3, cy - 2, 6, 14);
                // Foliage
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.arc(cx - 6, cy - 10, 9, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 7, cy - 8, 8, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 16, 9, 0, Math.PI * 2); ctx.fill();
                // Mango fruit
                ctx.fillStyle = plant.bloomColor;
                ctx.beginPath(); ctx.arc(cx + 3, cy - 4, 5, 0, Math.PI * 2); ctx.fill();
                break;
                
            case 'coconut':
                // Trunk
                ctx.fillStyle = '#5a4a30';
                ctx.fillRect(cx - 3, cy - 6, 6, 18);
                // Palm leaves
                ctx.fillStyle = plant.color;
                for (let i = 0; i < 6; i++) {
                    const angle = -Math.PI / 2 + (i - 2.5) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - 8);
                    ctx.quadraticCurveTo(cx + Math.cos(angle) * 20, cy - 15 + Math.sin(angle) * 5, cx + Math.cos(angle) * 25, cy - 10 + Math.sin(angle) * 10);
                    ctx.lineTo(cx + Math.cos(angle) * 20, cy - 5 + Math.sin(angle) * 8);
                    ctx.closePath();
                    ctx.fill();
                }
                // Coconuts
                ctx.fillStyle = '#3a2a20';
                ctx.beginPath(); ctx.arc(cx - 3, cy + 4, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 3, cy + 5, 4, 0, Math.PI * 2); ctx.fill();
                break;
                
            // === Category F: Farm Crops ===
            case 'corn':
                // Stalk
                ctx.fillStyle = '#44aa22';
                ctx.fillRect(cx - 2, cy - 10, 4, 20);
                // Leaves
                ctx.fillStyle = '#55bb33';
                ctx.beginPath(); ctx.ellipse(cx - 5, cy, 8, 2, -0.3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx + 5, cy + 2, 8, 2, 0.3, 0, Math.PI * 2); ctx.fill();
                // Corn cob
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.ellipse(cx, cy - 6, 5, 9, 0, 0, Math.PI * 2); ctx.fill();
                // Silk
                ctx.strokeStyle = '#ddaa44';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx - 2, cy - 18); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx + 2, cy - 17); ctx.stroke();
                break;
                
            case 'wheat':
                // Stalk
                ctx.strokeStyle = '#bbaa33';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, cy - 14); ctx.stroke();
                // Wheat heads
                ctx.fillStyle = plant.color;
                for (let i = 0; i < 4; i++) {
                    const hy = cy - 14 + i * 4;
                    ctx.beginPath(); ctx.ellipse(cx, hy, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
                }
                // Awns
                ctx.strokeStyle = '#aa8822';
                ctx.lineWidth = 0.5;
                for (let i = 0; i < 4; i++) {
                    const hy = cy - 14 + i * 4;
                    ctx.beginPath(); ctx.moveTo(cx, hy - 3); ctx.lineTo(cx - 3, hy - 6); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(cx, hy - 3); ctx.lineTo(cx + 3, hy - 6); ctx.stroke();
                }
                break;
                
            case 'potato':
                // Leaves
                ctx.fillStyle = '#44aa33';
                ctx.beginPath(); ctx.ellipse(cx - 5, cy - 6, 6, 2, -0.4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx + 5, cy - 6, 6, 2, 0.4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx, cy - 8, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
                // Tuber (underground)
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.ellipse(cx, cy + 4, 10, 7, 0.2, 0, Math.PI * 2); ctx.fill();
                // Spots
                ctx.fillStyle = '#6a4a30';
                ctx.beginPath(); ctx.arc(cx - 3, cy + 3, 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 4, cy + 5, 1, 0, Math.PI * 2); ctx.fill();
                break;
                
            case 'sweetpotato':
                // Leaves (heart shaped)
                ctx.fillStyle = '#55aa44';
                ctx.beginPath(); ctx.moveTo(cx - 6, cy - 4); ctx.quadraticCurveTo(cx - 10, cy - 8, cx - 6, cy - 8); ctx.quadraticCurveTo(cx - 2, cy - 8, cx - 6, cy - 4); ctx.fill();
                ctx.beginPath(); ctx.moveTo(cx + 6, cy - 2); ctx.quadraticCurveTo(cx + 10, cy - 6, cx + 6, cy - 6); ctx.quadraticCurveTo(cx + 2, cy - 6, cx + 6, cy - 2); ctx.fill();
                // Root
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.moveTo(cx, cy + 2); ctx.quadraticCurveTo(cx - 8, cy + 12, cx - 4, cy + 14); ctx.quadraticCurveTo(cx + 4, cy + 12, cx, cy + 2); ctx.fill();
                break;
                
            // === Category G: Legendary ===
            case 'phoenix':
                // Flame stem
                ctx.fillStyle = '#ff4400';
                ctx.beginPath(); ctx.moveTo(cx - 3, cy + 10); ctx.quadraticCurveTo(cx, cy, cx - 2, cy - 10); ctx.quadraticCurveTo(cx + 3, cy - 16, cx, cy - 14); ctx.lineTo(cx + 4, cy - 10); ctx.quadraticCurveTo(cx + 2, cy, cx + 4, cy + 10); ctx.fill();
                // Fire petals
                ctx.fillStyle = plant.color;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + this.time * 0.5;
                    ctx.beginPath();
                    ctx.ellipse(cx + Math.cos(angle) * 6, cy - 8 + Math.sin(angle) * 6, 7, 4, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Flame center
                const flamePulse = 0.7 + Math.sin(this.time * 4) * 0.3;
                ctx.fillStyle = plant.accent;
                ctx.globalAlpha = flamePulse;
                ctx.beginPath(); ctx.arc(cx, cy - 8, 5, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
                break;
                
            case 'spiritblossom':
                // Ethereal stem
                ctx.strokeStyle = 'rgba(200, 150, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.quadraticCurveTo(cx - 2, cy, cx, cy - 12); ctx.stroke();
                // Spirit petals (glowing)
                const spiritGlow = 0.6 + Math.sin(this.time * 2) * 0.3;
                ctx.fillStyle = plant.color;
                ctx.globalAlpha = spiritGlow;
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.ellipse(cx + Math.cos(angle) * 8, cy - 8 + Math.sin(angle) * 8, 8, 5, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Spirit core
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.8;
                ctx.beginPath(); ctx.arc(cx, cy - 8, 4, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
                break;
                
            case 'worldroot':
                // Massive root system
                ctx.fillStyle = '#2a4a2a';
                // Main root
                ctx.beginPath(); ctx.moveTo(cx - 8, cy + 10); ctx.lineTo(cx - 5, cy - 16); ctx.lineTo(cx + 5, cy - 16); ctx.lineTo(cx + 8, cy + 10); ctx.fill();
                // Root tendrils
                ctx.fillStyle = plant.color;
                ctx.beginPath(); ctx.arc(cx - 10, cy - 10, 8, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 10, cy - 8, 7, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 20, 10, 0, Math.PI * 2); ctx.fill();
                // Glowing runes
                ctx.fillStyle = plant.accent;
                const runePulse = 0.5 + Math.sin(this.time * 1.5) * 0.3;
                ctx.globalAlpha = runePulse;
                ctx.font = '10px serif';
                ctx.textAlign = 'center';
                ctx.fillText('✦', cx, cy - 10);
                ctx.fillText('✦', cx - 6, cy - 18);
                ctx.fillText('✦', cx + 6, cy - 16);
                ctx.globalAlpha = 1;
                break;
        }

        ctx.restore();
    }

    // ─── Bottom Bar ──────────────────────────────────────────────────────────

    _drawBottomBar() {
        const { ctx, canvas } = this;
        const P = this.PAL;
        const L = this.LAYOUT;
        const barH = L.BOTTOM_BAR_H;
        const barY = canvas.height - barH;

        // Wooden shelf
        this._drawWoodPanel(this.shopWidth, barY, canvas.width - this.shopWidth, barH, 0);

        // Top brass trim
        ctx.fillStyle = P.goldDim;
        ctx.fillRect(this.shopWidth, barY, canvas.width - this.shopWidth, 2);

        // Inventory label
        ctx.fillStyle = P.ivory;
        ctx.font = '700 12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📦 INVENTORY: ${this.inventory.length} items`, this.shopWidth + 20, barY + barH / 2);

        // Sell button (wooden sign)
        const btnW = 190;
        const btnH = 36;
        const btnX = canvas.width / 2 + 50 - btnW / 2;
        const btnY = barY + (barH - btnH) / 2;
        this._sellBtnArea = { x: btnX, y: btnY, w: btnW, h: btnH };

        const isBtnHover = (this.mouseX >= btnX && this.mouseX <= btnX + btnW &&
            this.mouseY >= btnY && this.mouseY <= btnY + btnH);

        if (this.inventory.length > 0) {
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 6);
            ctx.fillStyle = isBtnHover ? 'rgba(107, 142, 35, 0.35)' : 'rgba(107, 142, 35, 0.2)';
            ctx.fill();
            ctx.strokeStyle = isBtnHover ? P.olive : 'rgba(107, 142, 35, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = isBtnHover ? P.ivory : P.olive;
            ctx.font = '800 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`SELL ALL - $${this.inventoryValue}`, btnX + btnW / 2, btnY + btnH / 2);
        } else {
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 6);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(90, 80, 64, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = P.textMuted;
            ctx.font = '700 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SELL ALL - $0', btnX + btnW / 2, btnY + btnH / 2);
        }

        // Selected seed indicator
        if (this.selectedSeed) {
            const seed = this.PLANTS[this.selectedSeed];
            ctx.fillStyle = P.sage;
            ctx.font = '700 11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`SELECTED: ${seed.icon} ${seed.name}`, canvas.width - 20, barY + barH / 2);
        }
    }

    // ─── Event Banner ────────────────────────────────────────────────────────

    _drawEventBanner() {
        const { ctx, canvas } = this;
        if (!this.activeEvent || !this.EVENTS[this.activeEvent]) return;

        const evt = this.EVENTS[this.activeEvent];
        const L = this.LAYOUT;
        const bannerH = 30;
        const bannerY = L.TOP_BAR_H + 2;

        ctx.save();

        // Parchment scroll ribbon
        ctx.beginPath();
        ctx.rect(this.shopWidth, bannerY, canvas.width - this.shopWidth, bannerH);
        ctx.fillStyle = 'rgba(20, 15, 10, 0.85)';
        ctx.fill();

        // Color accent strip at bottom
        ctx.fillStyle = evt.color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(this.shopWidth, bannerY + bannerH - 2, canvas.width - this.shopWidth, 2);
        ctx.globalAlpha = 1;

        // Event text
        ctx.fillStyle = this.PAL.parchment;
        ctx.font = '700 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const remaining = Math.max(0, Math.ceil((this.eventEndTime - Date.now()) / 1000));
        ctx.fillText(
            `${evt.icon} ${evt.name.toUpperCase()} — ${evt.desc} ${remaining > 0 ? `(${remaining}s)` : ''}`,
            this.shopWidth + (canvas.width - this.shopWidth) / 2,
            bannerY + bannerH / 2
        );

        ctx.restore();
    }

    // ─── Particles & Floating Texts ──────────────────────────────────────────

    _drawParticles() {
        const { ctx } = this;
        ctx.save();
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * Math.max(0, p.life), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    _drawFloatingTexts() {
        const { ctx } = this;
        ctx.save();
        this.floatingTexts.forEach(ft => {
            ctx.globalAlpha = Math.min(1, ft.life * 2);
            ctx.fillStyle = ft.color;
            ctx.font = '700 15px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ft.text, ft.x, ft.y);
        });
        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME LOGIC HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    _getPlantCost(key) {
        const plant = this.PLANTS[key];
        let cost = plant.cost;
        if (this.activeEvent === 'sale') {
            cost = Math.floor(cost * 0.7);
        }
        return cost;
    }

    _sellAll() {
        if (this.inventory.length === 0) return;

        let total = this.inventoryValue;
        
        // World Root global bonus
        const hasWorldRoot = this.grid.flat().some(p => p && p.type === 'worldroot');
        if (hasWorldRoot) {
            const bonus = Math.floor(total * 0.1);
            total += bonus;
            this._addFloatingText(`+${bonus} World Bonus!`, this.canvas.width / 2 + 50, this.canvas.height - 130, this.PAL.gold);
        }
        
        this.money += total;
        this.score += total;

        this._addFloatingText(
            `+$${total}`,
            this.canvas.width / 2 + 50,
            this.canvas.height - 100,
            this.PAL.gold
        );
        this._spawnParticles(this.canvas.width / 2 + 50, this.canvas.height - 90, this.PAL.gold, 15);

        if (total >= 100) {
            if (window.soundManager) window.soundManager.playWin();
            if (window.gameManager) window.gameManager.shakeScreen(0.3);
        } else {
            if (window.soundManager) window.soundManager.playScore();
        }

        this.inventory = [];
        this.inventoryValue = 0;

        if (window.gameManager) {
            window.gameManager.checkAndUpdateHighScore('gardenempire', this.score);
        }
    }

    _recalcInventoryValue() {
        this.inventoryValue = this.inventory.reduce((sum, item) => sum + item.sellPrice, 0);
    }

    _tryTriggerEvent() {
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
            const bonus = 25 + Math.floor(Math.random() * 76);
            this.money += bonus;
            this.score += bonus;
            this._addFloatingText(`+$${bonus} BONUS!`, this.canvas.width / 2, 120, this.PAL.gold);
            this._spawnParticles(this.canvas.width / 2, 120, this.PAL.gold, 12);
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

    _infestRandomPlant() {
        const plants = [];
        for (let r = 0; r < this.GRID_SIZE; r++) {
            for (let c = 0; c < this.GRID_SIZE; c++) {
                if (this.grid[r][c] && !this.grid[r][c].hasBug) plants.push({ r, c });
            }
        }
        if (plants.length === 0) return;

        const target = plants[Math.floor(Math.random() * plants.length)];
        const cell = this.grid[target.r][target.c];
        const cx = this.gardenOffsetX + target.c * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;
        const cy = this.gardenOffsetY + target.r * (this.CELL_SIZE + this.GRID_PADDING) + this.CELL_SIZE / 2;

        if (cell.type === 'flytrap') {
            this._addFloatingText('CRUNCH!', cx, cy, this.PAL.green);
            this._spawnParticles(cx, cy, this.PAL.green, 5);
            if (window.soundManager) window.soundManager.playDing();
            return;
        }
        
        // Weather-proof plants (Coconut) immune to bugs too
        if (plant.weatherProof) {
            this._addFloatingText('Immune!', cx, cy, this.PAL.olive);
            this._spawnParticles(cx, cy, this.PAL.olive, 3);
            if (window.soundManager) window.soundManager.playClick();
            return;
        }

        cell.hasBug = true;
        cell.bugTimer = 3.5; // Seconds to squish

        this._addFloatingText('🐛 KILL IT!', cx, cy, this.PAL.oxblood);
        this._spawnParticles(cx, cy, this.PAL.oxblood, 4);
        if (window.soundManager) window.soundManager.playBuzz();
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 180,
                vy: (Math.random() - 0.5) * 180 - 40,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 3.5 + 1.5,
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
            <div class="game-over-title">🌿 Garden Closed!</div>
            <div class="game-over-score">Total Earnings: $${Math.floor(this.score)}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: $${hs}</div>`}
            <button class="game-over-btn" id="garden-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#garden-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    _checkLevelUp() {
        if (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            this.levelMultiplier += 0.05; // +5% profit per level
            
            this._addFloatingText('✨ LEVEL UP!', this.canvas.width / 2, 100, this.PAL.gold);
            if (window.soundManager) window.soundManager.playWin();
            
            // Recursive check in case they gain multiple levels
            this._checkLevelUp();
        }
    }

    _buyExpansion() {
        let cost = 0;
        if (this.unlockedSize === 4) cost = 1000;
        else if (this.unlockedSize === 5) cost = 5000;
        
        if (cost > 0 && this.money >= cost) {
            this.money -= cost;
            this.unlockedSize++;
            this._addFloatingText('🏗️ GARDEN EXPANDED!', this.canvas.width / 2, 100, this.PAL.olive);
            if (window.soundManager) window.soundManager.playScore();
            this._spawnParticles(this.canvas.width / 2, this.canvas.height / 2, this.PAL.wood, 20);
        } else {
            this.errorShake = 0.3;
            if (window.soundManager) window.soundManager.playBuzz();
        }
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
    canvasWidth: 960,
    canvasHeight: 600
});
