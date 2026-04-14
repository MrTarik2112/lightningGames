class BattleCards {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.canvas = null;
        this.ctx = null;
        this.width = 880;
        this.height = 540;
        
        this.state = 'menu';
        this.phase = 'draw';
        
        this.player = {
            hp: 100,
            maxHp: 100,
            mana: 3,
            maxMana: 3,
            block: 0,
            hand: [],
            deck: [],
            discard: [],
            energy: 1,
            maxEnergy: 1
        };
        
        this.enemy = null;
        this.enemyIntent = null;
        
        this.cards = this.initializeCards();
        this.battleLog = [];
        this.comboCount = 0;
        this.turnCount = 0;
        this.wave = 1;
        
        this.selectedCard = null;
        this.hoveredCard = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.particles = [];
        this.shakeAmount = 0;
        this.screenFlash = null;
        
        this.animationQueue = [];
    }

    initializeCards() {
        return {
            attack: [
                { id: 'strike', name: 'Strike', cost: 1, damage: 6, desc: 'Deal 6 damage', icon: '⚔️' },
                { id: 'slash', name: 'Slash', cost: 1, damage: 8, desc: 'Deal 8 damage', icon: '🗡️' },
                { id: 'heavy', name: 'Heavy Blow', cost: 2, damage: 14, desc: 'Deal 14 damage', icon: '💥' },
                { id: 'double', name: 'Double Strike', cost: 2, damage: 10, hits: 2, desc: 'Deal 10 damage twice', icon: '⚔️⚔️' },
                { id: 'finisher', name: 'Finisher', cost: 3, damage: 25, desc: 'Deal 25 damage', icon: '💀' },
                { id: 'pierce', name: 'Pierce', cost: 2, damage: 12, armorPierce: true, desc: 'Deal 12, ignore armor', icon: '🎯' },
                { id: 'rush', name: 'Rush', cost: 0, damage: 4, desc: 'Deal 4 damage', icon: '🏃' },
                { id: ' Execute', name: 'Execute', cost: 3, damage: 30, requireLowHp: true, desc: 'Deal 30 if enemy < 50% HP', icon: '🔪' }
            ],
            defense: [
                { id: 'block', name: 'Block', cost: 1, block: 5, desc: 'Gain 5 block', icon: '🛡️' },
                { id: 'iron', name: 'Iron Wall', cost: 2, block: 12, desc: 'Gain 12 block', icon: '🏰' },
                { id: 'fortify', name: 'Fortify', cost: 2, block: 8, heal: 5, desc: 'Gain 8 block, heal 5', icon: '🧱' },
                { id: 'dodge', name: 'Dodge', cost: 1, dodge: 1, desc: 'Dodge next attack', icon: '💨' },
                { id: 'reflect', name: 'Reflect', cost: 2, reflect: 0.5, desc: 'Reflect 50% damage', icon: '🔄' },
                { id: 'fortitude', name: 'Fortitude', cost: 1, block: 6, desc: 'Gain 6 block', icon: '🛡️' },
                { id: 'shell', name: 'Shell', cost: 2, block: 10, desc: 'Gain 10 block', icon: '🐚' },
                { id: 'stand', name: 'Stand Ground', cost: 3, block: 20, desc: 'Gain 20 block', icon: '🚩' }
            ],
            magic: [
                { id: 'fireball', name: 'Fireball', cost: 2, damage: 10, effect: 'burn', effectDuration: 3, desc: 'Deal 10, burn 3', icon: '🔥' },
                { id: 'ice', name: 'Ice Shard', cost: 1, damage: 5, slow: 1, desc: 'Deal 5, slow 1 turn', icon: '❄️' },
                { id: 'lightning', name: 'Lightning', cost: 2, damage: 12, chain: 2, desc: 'Deal 12, chain to enemy', icon: '⚡' },
                { id: 'poison', name: 'Poison', cost: 2, damage: 8, poison: 5, desc: 'Deal 8, poison 5 turns', icon: '🧪' },
                { id: 'heal', name: 'Heal', cost: 2, heal: 15, desc: 'Heal 15 HP', icon: '💚' },
                { id: 'mana', name: 'Mana Flow', cost: 0, mana: 1, desc: 'Gain 1 mana', icon: '💙' },
                { id: 'flame', name: 'Flame Wave', cost: 3, damage: 20, effect: 'burn', effectDuration: 4, desc: 'Deal 20, burn 4', icon: '🌊' },
                { id: 'drain', name: 'Life Drain', cost: 2, damage: 8, drain: 8, desc: 'Deal 8, heal 8', icon: '🧛' }
            ],
            support: [
                { id: 'draw', name: 'Quick Draw', cost: 1, draw: 2, desc: 'Draw 2 cards', icon: '🃏' },
                { id: 'energy', name: 'Energize', cost: 1, energy: 1, desc: 'Gain 1 energy', icon: '⚡' },
                { id: 'upgrade', name: 'Upgrade', cost: 1, upgrade: 1, desc: 'Upgrade random card', icon: '⬆️' },
                { id: 'clone', name: 'Clone', cost: 2, duplicate: true, desc: 'Duplicate random card', icon: '👥' },
                { id: 'scavenge', name: 'Scavenge', cost: 1, discardDraw: 2, desc: 'Discard 2, draw 2', icon: '🔍' },
                { id: 'focus', name: 'Focus', cost: 0, draw: 1, desc: 'Draw 1 card', icon: '🎯' },
                { id: 'preparation', name: 'Preparation', cost: 2, draw: 3, desc: 'Draw 3 cards', icon: '📋' },
                { id: 'adrenaline', name: 'Adrenaline', cost: 1, energy: 2, draw: 1, desc: 'Gain 2 energy, draw 1', icon: '💉' }
            ]
        };
    }

    createDeck() {
        const deck = [];
        for (let i = 0; i < 3; i++) deck.push({ ...this.cards.attack[0] });
        for (let i = 0; i < 2; i++) deck.push({ ...this.cards.attack[1] });
        deck.push({ ...this.cards.attack[2] });
        for (let i = 0; i < 3; i++) deck.push({ ...this.cards.defense[0] });
        for (let i = 0; i < 2; i++) deck.push({ ...this.cards.defense[1] });
        for (let i = 0; i < 2; i++) deck.push({ ...this.cards.magic[0] });
        for (let i = 0; i < 2; i++) deck.push({ ...this.cards.magic[4] });
        for (let i = 0; i < 2; i++) deck.push({ ...this.cards.support[0] });
        deck.push({ ...this.cards.support[5] });
        
        return this.shuffle(deck);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    generateEnemy(wave) {
        const baseEnemies = [
            { name: 'Slime', hp: 20, damage: 5, block: 0, icon: '🟢' },
            { name: 'Goblin', hp: 35, damage: 8, block: 0, icon: '👺' },
            { name: 'Skeleton', hp: 45, damage: 10, block: 3, icon: '💀' },
            { name: 'Orc', hp: 60, damage: 12, block: 5, icon: '👹' },
            { name: 'Dark Knight', hp: 80, damage: 15, block: 10, icon: '🖤' },
            { name: 'Dragon', hp: 120, damage: 20, block: 8, icon: '🐉' }
        ];
        
        const bossEnemies = [
            { name: 'Necromancer', hp: 150, damage: 18, block: 15, icon: '🧙', boss: true },
            { name: 'Dragon Lord', hp: 200, damage: 25, block: 20, icon: '🐲', boss: true },
            { name: 'Demon King', hp: 300, damage: 30, block: 25, icon: '😈', boss: true }
        ];
        
        let enemy;
        if (wave % 10 === 0 && wave > 0) {
            const bossIndex = Math.min(Math.floor(wave / 10) - 1, bossEnemies.length - 1);
            enemy = { ...bossEnemies[bossIndex] };
        } else {
            const index = Math.min(Math.floor((wave - 1) / 3), baseEnemies.length - 1);
            enemy = { ...baseEnemies[index] };
        }
        
        const scale = 1 + (wave - 1) * 0.15;
        enemy.maxHp = Math.floor(enemy.hp * scale);
        enemy.hp = enemy.maxHp;
        enemy.damage = Math.floor(enemy.damage * scale);
        enemy.block = 0;
        enemy.effects = [];
        
        return enemy;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.player.deck = this.createDeck();
        this.player.hand = [];
        this.player.discard = [];
        this.player.hp = this.player.maxHp;
        this.player.mana = this.player.maxMana;
        
        this.enemy = this.generateEnemy(this.wave);
        this.wave = 1;
        
        this.drawCards(5);
        this.state = 'battle';
        this.phase = 'play';
        
        this.handleInput = this.handleInput.bind(this);
        document.addEventListener('mousemove', this.handleInput);
        document.addEventListener('click', this.handleInput);
        document.addEventListener('keydown', this.handleInput);
        
        window.soundManager?.playShow();
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.player.deck.length === 0) {
                if (this.player.discard.length === 0) break;
                this.player.deck = this.shuffle([...this.player.discard]);
                this.player.discard = [];
            }
            if (this.player.deck.length > 0) {
                this.player.hand.push(this.player.deck.pop());
            }
        }
    }

    update(dt) {
        if (this.gameOver) return;
        
        if (this.shakeAmount > 0) {
            this.shakeAmount *= 0.9;
            if (this.shakeAmount < 0.5) this.shakeAmount = 0;
        }
        
        if (this.screenFlash) {
            this.screenFlash.alpha -= dt * 3;
            if (this.screenFlash.alpha <= 0) this.screenFlash = null;
        }
        
        this.updateParticles(dt);
        this.processAnimations(dt);
    }

    updateParticles(dt) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = p.life / p.maxLife;
            return p.life > 0;
        });
    }

    processAnimations(dt) {
        if (this.animationQueue.length > 0) {
            const anim = this.animationQueue[0];
            anim.progress += dt * 2;
            if (anim.progress >= 1) {
                this.animationQueue.shift();
            }
        }
    }

    spawnParticle(x, y, type, color) {
        const count = type === 'explosion' ? 20 : 5;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 1,
                color: color || '#00d4ff',
                size: 3 + Math.random() * 5,
                alpha: 1
            });
        }
    }

    playCard(card, cardIndex) {
        if (this.player.mana < card.cost) {
            window.soundManager?.playBuzz();
            return;
        }
        
        this.player.mana -= card.cost;
        
        let damage = card.damage || 0;
        let block = card.block || 0;
        let heal = card.heal || 0;
        let draw = card.draw || 0;
        
        if (card.drain) {
            damage = card.drain;
            heal = card.drain;
        }
        
        if (card.requireLowHp && this.enemy.hp > this.enemy.maxHp * 0.5) {
            window.soundManager?.playBuzz();
            this.player.mana += card.cost;
            return;
        }
        
        if (damage > 0) {
            let finalDamage = damage;
            if (!card.armorPierce && this.enemy.block > 0) {
                const blocked = Math.min(this.enemy.block, finalDamage);
                this.enemy.block -= blocked;
                finalDamage -= blocked;
            }
            
            if (finalDamage > 0) {
                this.enemy.hp -= finalDamage;
                this.comboCount++;
                this.score += finalDamage * this.comboCount;
                this.spawnParticle(this.width - 150, 150, 'explosion', '#ff4466');
                window.soundManager?.playHit();
                this.shakeAmount = 10;
            } else {
                this.spawnParticle(this.width - 150, 150, 'hit', '#888888');
                window.soundManager?.playBlock();
            }
            
            if (card.effect) {
                this.enemy.effects.push({
                    type: card.effect,
                    duration: card.effectDuration,
                    value: card.effect === 'burn' ? 3 : 0
                });
            }
            
            if (card.chain) {
                for (let i = 0; i < card.chain; i++) {
                    setTimeout(() => {
                        this.enemy.hp -= 5;
                        this.spawnParticle(this.width - 150, 150, 'spark', '#ffff00');
                    }, 200 * (i + 1));
                }
            }
        }
        
        if (block > 0) {
            this.player.block = (this.player.block || 0) + block;
            this.spawnParticle(100, this.height - 200, 'block', '#00ff88');
            window.soundManager?.playBlock();
        }
        
        if (heal > 0) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
            this.spawnParticle(100, this.height - 200, 'heal', '#00ff88');
            window.soundManager?.playDing();
        }
        
        if (draw > 0) {
            setTimeout(() => this.drawCards(draw), 300);
            window.soundManager?.playCard();
        }
        
        this.player.discard.push(card);
        this.player.hand.splice(cardIndex, 1);
        
        this.battleLog.unshift(`Played ${card.name}`);
        
        window.soundManager?.playSelect();
        
        this.checkGameEnd();
    }

    enemyTurn() {
        if (this.enemy.hp <= 0) return;
        
        this.enemy.effects = this.enemy.effects.filter(e => {
            if (e.type === 'burn') {
                const burnDamage = 3;
                this.enemy.hp -= burnDamage;
                this.score += burnDamage;
                this.spawnParticle(this.width - 150, 150, 'burn', '#ff6600');
            }
            e.duration--;
            return e.duration > 0;
        });
        
        if (this.enemy.hp <= 0) {
            this.checkGameEnd();
            return;
        }
        
        const intent = Math.random();
        
        if (intent < 0.6) {
            let damage = this.enemy.damage;
            if (this.player.block > 0) {
                const blocked = Math.min(this.player.block, damage);
                this.player.block -= blocked;
                damage -= blocked;
                window.soundManager?.playBlock();
            }
            
            if (damage > 0) {
                this.player.hp -= damage;
                this.score = Math.max(0, this.score - damage * 2);
                this.shakeAmount = 15;
                this.screenFlash = { color: '#ff0000', alpha: 0.3 };
                window.soundManager?.playHit();
                this.comboCount = 0;
            }
        } else if (intent < 0.8) {
            this.enemy.block = (this.enemy.block || 0) + 5;
            window.soundManager?.playBlock();
        }
        
        this.player.block = 0;
        this.player.energy = this.player.maxEnergy;
        
        this.checkGameEnd();
    }

    endTurn() {
        // Set enemy intent for next turn BEFORE enemy acts
        const intent = Math.random();
        if (intent < 0.6) {
            this.enemyIntent = { type: 'attack', value: this.enemy.damage };
        } else if (intent < 0.8) {
            this.enemyIntent = { type: 'block', value: 5 };
        } else {
            this.enemyIntent = { type: 'wait', value: 0 };
        }
        
        this.enemyTurn();
        
        if (!this.gameOver) {
            this.player.mana = this.player.maxMana;
            this.turnCount++;
            
            while (this.player.hand.length > 6) {
                this.player.discard.push(this.player.hand.pop());
            }
            
            this.drawCards(2);
        }
    }

    checkGameEnd() {
        if (this.player.hp <= 0) {
            this.player.hp = 0;
            this.gameOver = true;
            this.state = 'defeat';
            window.soundManager?.playDeath();
            
            localStorage.setItem('lg_battlecards_best', Math.max(this.score, parseInt(localStorage.getItem('lg_battlecards_best') || '0')));
        } else if (this.enemy.hp <= 0) {
            const waveReward = this.wave * 50 + 100;
            this.score += waveReward;
            
            this.spawnParticle(this.width / 2, this.height / 2, 'win', '#00ff88');
            window.soundManager?.playWin();
            
            this.wave++;
            
            setTimeout(() => {
                this.enemy = this.generateEnemy(this.wave);
                this.drawCards(3);
                this.player.mana = this.player.maxMana;
                this.player.block = 0;
            }, 1500);
        }
    }

    draw() {
        const ctx = this.ctx;
        
        ctx.save();
        if (this.shakeAmount > 0) {
            ctx.translate(
                (Math.random() - 0.5) * this.shakeAmount,
                (Math.random() - 0.5) * this.shakeAmount
            );
        }
        
        ctx.fillStyle = '#050512';
        ctx.fillRect(0, 0, this.width, this.height);
        
        if (this.state === 'menu') {
            this.drawMenu(ctx);
            ctx.restore();
            return;
        }
        
        this.drawBattlefield(ctx);
        this.drawPlayer(ctx);
        this.drawEnemy(ctx);
        this.drawHand(ctx);
        this.drawUI(ctx);
        this.drawParticles(ctx);
        
        if (this.screenFlash) {
            ctx.fillStyle = this.screenFlash.color;
            ctx.globalAlpha = this.screenFlash.alpha;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.globalAlpha = 1;
        }
        
        if (this.state === 'defeat') {
            this.drawGameOver(ctx);
        }
        
        ctx.restore();
    }

    drawBattlefield(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#050510');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.height);
            ctx.stroke();
        }
        for (let i = 0; i < this.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(this.width, i);
            ctx.stroke();
        }
    }

    drawPlayer(ctx) {
        const x = 100;
        const y = this.height - 200;
        
        ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#00d4ff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🧙', x, y + 15);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(`${this.player.hp}/${this.player.maxHp}`, x, y + 85);
        
        if (this.player.block > 0) {
            ctx.fillStyle = '#00ff88';
            ctx.fillText(`🛡️ ${this.player.block}`, x, y + 105);
        }
    }

    drawEnemy(ctx) {
        const x = this.width - 150;
        const y = 180;
        
        if (!this.enemy) return;
        
        ctx.fillStyle = 'rgba(255, 68, 102, 0.1)';
        ctx.beginPath();
        ctx.arc(x, y, 70, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.enemy.hp < this.enemy.maxHp * 0.3 ? '#ff4466' : '#ff00aa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 70, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ff00aa';
        ctx.font = '45px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.enemy.icon, x, y + 15);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(this.enemy.name, x, y - 80);
        
        ctx.fillStyle = '#333344';
        ctx.fillRect(x - 60, y - 70, 120, 12);
        ctx.fillStyle = this.enemy.hp < this.enemy.maxHp * 0.3 ? '#ff4466' : '#ff00aa';
        ctx.fillRect(x - 60, y - 70, 120 * (this.enemy.hp / this.enemy.maxHp), 12);
        
        if (this.enemy.block > 0) {
            ctx.fillStyle = '#00ff88';
            ctx.font = '14px Arial';
            ctx.fillText(`🛡️ ${this.enemy.block}`, x, y + 100);
        }
        
        if (this.enemy.effects && this.enemy.effects.length > 0) {
            let effectX = x - 40;
            this.enemy.effects.forEach(e => {
                if (e.type === 'burn') {
                    ctx.fillStyle = '#ff6600';
                    ctx.font = '16px Arial';
                    ctx.fillText('🔥', effectX, y + 100);
                    effectX += 20;
                }
            });
        }
        
        // Enemy intent display
        if (this.enemyIntent) {
            ctx.textAlign = 'center';
            if (this.enemyIntent.type === 'attack') {
                ctx.fillStyle = '#ff4466';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(`⚔️ ${this.enemyIntent.value}`, x, y - 55);
            } else if (this.enemyIntent.type === 'block') {
                ctx.fillStyle = '#00ff88';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(`🛡️ ${this.enemyIntent.value}`, x, y - 55);
            }
        }
    }

    drawHand(ctx) {
        const cardWidth = 100;
        const cardHeight = 140;
        const startX = (this.width - (this.player.hand.length * 110 + (this.player.hand.length - 1) * 10)) / 2;
        const handY = this.height - 120;
        
        this.player.hand.forEach((card, index) => {
            const x = startX + index * 110;
            const y = handY;
            
            const isHovered = this.hoveredCard === index;
            const isSelected = this.selectedCard === index;
            const canAfford = this.player.mana >= card.cost;
            
            ctx.save();
            
            if (isHovered || isSelected) {
                ctx.translate(x + cardWidth / 2, y - 20);
                ctx.scale(1.1, 1.1);
                ctx.translate(-(x + cardWidth / 2), -(y - 20));
            }
            
            const gradient = ctx.createLinearGradient(x, y, x, y + cardHeight);
            if (card.category === 'attack') {
                gradient.addColorStop(0, '#2a1a1a');
                gradient.addColorStop(1, '#1a0a0a');
            } else if (card.category === 'defense') {
                gradient.addColorStop(0, '#1a2a1a');
                gradient.addColorStop(1, '#0a1a0a');
            } else if (card.category === 'magic') {
                gradient.addColorStop(0, '#1a1a2a');
                gradient.addColorStop(1, '#0a0a1a');
            } else {
                gradient.addColorStop(0, '#2a2a1a');
                gradient.addColorStop(1, '#1a1a0a');
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y - (isHovered || isSelected ? 20 : 0), cardWidth, cardHeight, 8);
            ctx.fill();
            
            ctx.strokeStyle = canAfford ? (isSelected ? '#00ff88' : '#00d4ff') : '#555555';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = canAfford ? '#ffffff' : '#666666';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(card.icon, x + cardWidth / 2, y + 35 - (isHovered || isSelected ? 20 : 0));
            
            ctx.fillStyle = canAfford ? '#00d4ff' : '#555555';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(card.name.substring(0, 10), x + cardWidth / 2, y + 55 - (isHovered || isSelected ? 20 : 0));
            
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`💎${card.cost}`, x + cardWidth - 15, y + 20 - (isHovered || isSelected ? 20 : 0));
            
            ctx.fillStyle = '#888888';
            ctx.font = '10px Arial';
            ctx.fillText(card.desc.substring(0, 15), x + cardWidth / 2, y + 100 - (isHovered || isSelected ? 20 : 0));
            
            ctx.restore();
            
            card._x = x;
            card._y = y - (isHovered || isSelected ? 20 : 0);
            card._w = cardWidth;
            card._h = cardHeight;
        });
    }

    drawUI(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.width, 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`💎 ${this.player.mana}/${this.player.maxMana}`, 20, 32);
        
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${this.wave}`, this.width / 2, 32);
        
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${this.score}`, this.width - 20, 32);
        
        if (this.comboCount > 1) {
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`🔥 x${this.comboCount} COMBO!`, this.width / 2, 55);
        }
        
        const endTurnX = this.width - 120;
        const endTurnY = this.height - 140;
        
        ctx.fillStyle = this.player.mana > 0 ? '#00d4ff' : '#555555';
        ctx.beginPath();
        ctx.roundRect(endTurnX, endTurnY, 100, 40, 8);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('END TURN', endTurnX + 50, endTurnY + 25);
    }

    drawParticles(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.fillStyle = '#ff4466';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DEFEAT', this.width / 2, this.height / 2 - 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
        
        ctx.fillStyle = '#00d4ff';
        ctx.font = '18px Arial';
        ctx.fillText(`Waves Survived: ${this.wave - 1}`, this.width / 2, this.height / 2 + 60);
        
        ctx.font = '16px Arial';
        ctx.fillText('Press ESC to return to menu', this.width / 2, this.height / 2 + 100);
    }

    handleInput(e) {
        // ESC returns to menu from battle or defeat
        if (e.key === 'Escape') {
            if (this.state === 'defeat') {
                this.destroy();
                window.launcher?.showGameSelection();
            } else if (this.state === 'battle') {
                this.resetToMenu();
            }
            return;
        }
        
        if (this.state === 'menu') {
            if (e.type === 'click') {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const startBtn = { x: this.width / 2 - 80, y: this.height / 2 + 20, w: 160, h: 50 };
                if (x >= startBtn.x && x <= startBtn.x + startBtn.w &&
                    y >= startBtn.y && y <= startBtn.y + startBtn.h) {
                    this.init(this.canvas, this.ctx);
                }
            }
            return;
        }
        
        if (this.state === 'defeat') {
            return;
        }
        
        if (e.type === 'mousemove') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.hoveredCard = null;
            this.player.hand.forEach((card, index) => {
                if (card._x && card._y) {
                    if (x >= card._x && x <= card._x + card._w &&
                        y >= card._y && y <= card._y + card._h) {
                        this.hoveredCard = index;
                    }
                }
            });
            return;
        }
        
        if (e.type === 'click') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            for (let i = this.player.hand.length - 1; i >= 0; i--) {
                const card = this.player.hand[i];
                if (card._x && card._y) {
                    if (x >= card._x && x <= card._x + card._w &&
                        y >= card._y && y <= card._y + card._h) {
                        if (this.player.mana >= card.cost) {
                            this.playCard(card, i);
                        }
                        return;
                    }
                }
            }
            
            const endTurnX = this.width - 120;
            const endTurnY = this.height - 140;
            if (x >= endTurnX && x <= endTurnX + 100 &&
                y >= endTurnY && y <= endTurnY + 40) {
                this.endTurn();
            }
        }
    }

    getScore() {
        return this.score;
    }

    isGameOver() {
        return this.gameOver;
    }

    destroy() {
        document.removeEventListener('mousemove', this.handleInput);
        document.removeEventListener('click', this.handleInput);
        document.removeEventListener('keydown', this.handleInput);
    }
    
    resetToMenu() {
        this.state = 'menu';
        this.wave = 1;
        this.score = 0;
        this.player.hand = [];
        this.player.discard = [];
        this.player.deck = [];
        this.comboCount = 0;
        this.turnCount = 0;
    }
    
    drawMenu(ctx) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        
        // Draw battlefield background
        ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(cx, cy - 100, 150, 0, Math.PI * 2);
        ctx.fill();
        
        // Title
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fillText('BATTLE CARDS', cx, cy - 100);
        ctx.shadowBlur = 0;
        
        // Subtitle
        ctx.font = '18px Arial';
        ctx.fillStyle = '#888899';
        ctx.fillText('Card Battle Duel', cx, cy - 65);
        
        // High score
        const bestScore = localStorage.getItem('lg_battlecards_best') || '0';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`Best: ${bestScore}`, cx, cy - 30);
        
        // Start button
        const startBtn = { x: cx - 80, y: cy + 30, w: 160, h: 50 };
        
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(startBtn.x, startBtn.y, startBtn.w, startBtn.h, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('START', cx, startBtn.y + 32);
        
        // Instructions
        ctx.fillStyle = '#555566';
        ctx.font = '14px Arial';
        ctx.fillText('Click cards to play • End Turn to confirm', cx, cy + 110);
        ctx.fillText('Press ESC to return to menu', cx, cy + 135);
    }
}
