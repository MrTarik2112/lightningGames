// Neon Piano v1.0 - Interactive Piano Game
class NeonPiano {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.mode = 'free'; // 'free' or 'challenge'
        this.keys = [];
        this.whiteKeyWidth = 0;
        this.keyHeight = 0;
        this.activeKeys = new Set();
        this.particles = [];
        this.challengeNotes = [];
        this.challengeIndex = 0;
        this.challengeTimer = 0;
        this.fallingNotes = [];
        this.noteSpeed = 120;
        this.combo = 0;
        this.maxCombo = 0;
        this._keyHandler = null;
        this._mouseHandler = null;
        
        this.whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        this.blackKeys = ['Cs', 'Ds', 'Fs', 'Gs', 'As'];
        
        this.noteFreqs = {
            'C2': 65.41, 'Cs2': 69.30, 'D2': 73.42, 'Ds2': 77.78, 'E2': 82.41, 'F2': 87.31, 'Fs2': 92.50, 'G2': 98.00, 'Gs2': 103.83, 'A2': 110.00, 'As2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'Cs3': 138.59, 'D3': 146.83, 'Ds3': 155.56, 'E3': 164.81, 'F3': 174.61, 'Fs3': 185.00, 'G3': 196.00, 'Gs3': 207.65, 'A3': 220.00, 'As3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'Cs4': 277.18, 'D4': 293.66, 'Ds4': 311.13, 'E4': 329.63, 'F4': 349.23, 'Fs4': 369.99, 'G4': 392.00, 'Gs4': 415.30, 'A4': 440.00, 'As4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'Cs5': 554.37, 'D5': 587.33, 'Ds5': 622.25, 'E5': 659.25, 'F5': 698.46, 'Fs5': 739.99, 'G5': 783.99, 'Gs5': 830.61, 'A5': 880.00, 'As5': 932.33, 'B5': 987.77
        };
        
        this.keyMap = {
            'a': 'C4', 'w': 'Cs4', 's': 'D4', 'e': 'Ds4', 'd': 'E4', 'f': 'F4', 
            't': 'Fs4', 'g': 'G4', 'y': 'Gs4', 'h': 'A4', 'u': 'As4', 'j': 'B4',
            'k': 'C5', 'o': 'Cs5', 'l': 'D5', 'p': 'Ds5', ';': 'E5'
        };
        
        this.displayKeyMap = {
            'C4': 'A', 'Cs4': 'W', 'D4': 'S', 'Ds4': 'E', 'E4': 'D', 'F4': 'F',
            'Fs4': 'T', 'G4': 'G', 'Gs4': 'Y', 'A4': 'H', 'As4': 'U', 'B4': 'J',
            'C5': 'K', 'Cs5': 'O', 'D5': 'L', 'Ds5': 'P', 'E5': ';'
        };
    }
    
    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.mode = 'free';
        this.combo = 0;
        this.maxCombo = 0;
        this.lives = 5;
        this.feedback = [];
        this.particles = [];
        this.challengeNotes = [];
        this.challengeIndex = 0;
        this._initKeys();
        this._bindInput();
        this._startChallenge();
    }
    
    _initKeys() {
        const totalWhiteKeys = 15;
        this.whiteKeyWidth = this.canvas.width / totalWhiteKeys;
        this.keyHeight = this.canvas.height * 0.75;
        
        this.keys = [];
        
        for (let i = 0; i < totalWhiteKeys; i++) {
            const note = this.whiteKeys[i % 7];
            const octave = Math.floor(i / 7) + 3;
            const keyName = note + octave;
            
            this.keys.push({
                note: keyName,
                x: i * this.whiteKeyWidth,
                y: this.canvas.height - this.keyHeight,
                width: this.whiteKeyWidth,
                height: this.keyHeight,
                color: '#ffffff',
                isBlack: false
            });
        }
        
        const blackKeyPositions = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
        const blackKeyNotes = ['Cs', 'Ds', 'Fs', 'Gs', 'As'];
        
        for (let i = 0; i < blackKeyPositions.length; i++) {
            const pos = blackKeyPositions[i];
            const noteBase = blackKeyNotes[i % 5];
            const octave = Math.floor(i / 5) + 3;
            const keyName = noteBase + octave;
            
            this.keys.push({
                note: keyName,
                x: (pos + 0.65) * this.whiteKeyWidth,
                y: this.canvas.height - this.keyHeight,
                width: this.whiteKeyWidth * 0.7,
                height: this.keyHeight * 0.6,
                color: '#1a1a2e',
                isBlack: true
            });
        }
    }
    
    _bindInput() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._mouseHandler) document.removeEventListener('mousedown', this._mouseHandler);
        
        this._keyHandler = (e) => {
            const key = e.key.toLowerCase();
            
            // Restart game when game over
            if (e.code === 'Space' && this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            // Toggle mode
            if (e.code === 'Space') {
                if (this.mode === 'free') {
                    this.mode = 'challenge';
                    this._startChallenge();
                } else {
                    this.mode = 'free';
                    this.fallingNotes = [];
                    this.challengeNotes = [];
                }
                return;
            }
            
            if (this.keyMap[key] && !this.gameOver) {
                this._playKey(this.keyMap[key]);
            }
        };
        
        this._mouseHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            for (const key of this.keys) {
                if (x >= key.x && x <= key.x + key.width && y >= key.y && y <= key.y + key.height) {
                    this._playKey(key.note);
                    break;
                }
            }
        };
        
        document.addEventListener('keydown', this._keyHandler);
        this.canvas.addEventListener('mousedown', this._mouseHandler);
    }
    
    _playKey(note) {
        if (this.activeKeys.has(note)) return;
        
        this.activeKeys.add(note);
        
        const freq = this.noteFreqs[note];
        if (freq) {
            this._playPianoSound(freq);
            this._spawnParticles(note);
            
            // Duck background music when playing piano
            if (window.soundManager && window.soundManager.duckMusic) {
                window.soundManager.duckMusic(0.15);
            }
            
            if (this.mode === 'challenge') {
                this._checkChallenge(note);
            }
        }
        
        setTimeout(() => {
            this.activeKeys.delete(note);
        }, 150);
    }
    
    _playPianoSound(freq) {
        if (!this.canvas || !window.soundManager) return;
        
        const sm = window.soundManager;
        if (!sm.ctx) return;
        
        const now = sm.ctx.currentTime;
        
        // Main oscillator - sine wave
        const osc1 = sm.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        
        // Harmonic oscillator - triangle for brightness
        const osc2 = sm.ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq, now);
        
        // Upper harmonic for piano character
        const osc3 = sm.ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 2, now); // Octave up
        
        // Gain nodes for ADSR envelope
        const gain1 = sm.ctx.createGain();
        const gain2 = sm.ctx.createGain();
        const gain3 = sm.ctx.createGain();
        const masterGain = sm.ctx.createGain();
        
        const vol = sm.volume * 0.35;
        
        // ADSR Envelope
        const attack = 0.01;
        const decay = 0.1;
        const sustain = 0.3;
        const release = 1.2;
        
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(vol, now + attack);
        masterGain.gain.linearRampToValueAtTime(vol * sustain, now + attack + decay);
        
        // Connect oscillators
        gain1.gain.value = 0.6;
        gain2.gain.value = 0.3;
        gain3.gain.value = 0.1;
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        
        gain1.connect(masterGain);
        gain2.connect(masterGain);
        gain3.connect(masterGain);
        
        masterGain.connect(sm.masterGain);
        
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        
        // Note release
        const noteOff = () => {
            const stopTime = sm.ctx.currentTime;
            masterGain.gain.cancelScheduledValues(stopTime);
            masterGain.gain.setValueAtTime(masterGain.gain.value, stopTime);
            masterGain.gain.linearRampToValueAtTime(0, stopTime + release);
            
            osc1.stop(stopTime + release + 0.1);
            osc2.stop(stopTime + release + 0.1);
            osc3.stop(stopTime + release + 0.1);
        };
        
        // Store note off handler for key release
        this._noteOffHandlers = this._noteOffHandlers || {};
        if (this._noteOffHandlers[freq]) {
            this._noteOffHandlers[freq]();
        }
        this._noteOffHandlers[freq] = noteOff;
        
        // Auto release after max duration
        setTimeout(() => {
            if (this._noteOffHandlers[freq] === noteOff) {
                noteOff();
                delete this._noteOffHandlers[freq];
            }
        }, 3000);
    }
    
    _spawnParticles(note, count = 8) {
        const key = this.keys.find(k => k.note === note);
        if (!key) return;
        
        const cx = key.x + key.width / 2;
        const cy = key.y;
        const colors = key.isBlack ? 
            ['#ff00aa', '#ff66cc', '#ff3388', '#aa0066'] : 
            ['#00d4ff', '#00ffff', '#66eeff', '#0088aa'];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 100 + Math.random() * 200;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: -Math.abs(Math.sin(angle) * speed) - 50,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 5 + 2,
                decay: 1.5 + Math.random() * 0.5
            });
        }
        
        // Add glow particles
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: cx + (Math.random() - 0.5) * key.width,
                y: cy + Math.random() * 20,
                vx: (Math.random() - 0.5) * 50,
                vy: -Math.random() * 30 - 10,
                life: 0.8,
                color: key.isBlack ? 'rgba(255, 0, 170, 0.5)' : 'rgba(0, 212, 255, 0.5)',
                size: Math.random() * 15 + 10,
                decay: 2,
                isGlow: true
            });
        }
    }
    
    _startChallenge() {
        this.mode = 'challenge';
        this.challengeNotes = [];
        this.fallingNotes = [];
        this.challengeIndex = 0;
        this.challengeTimer = 0;
        
        const availableNotes = Object.keys(this.noteFreqs).filter(n => 
            (n.endsWith('4') || n.endsWith('5')) && !n.includes('s')
        ); // Only white keys for challenge for simplicity
        
        for (let i = 0; i < 30; i++) {
            const noteName = availableNotes[Math.floor(Math.random() * availableNotes.length)];
            const key = this.keys.find(k => k.note === noteName);
            if (key) {
                this.challengeNotes.push({
                    note: noteName,
                    spawnTime: i * 1200, // Time in ms to spawn this note
                    x: key.x + key.width / 2,
                    y: -50, // Start above canvas
                    vy: 150, // pixels per second
                    width: key.width * 0.8,
                    height: 20,
                    hit: false,
                    missed: false,
                    color: key.color // Use key's color for falling note
                });
            }
        }
    }
    
    _checkChallenge(note) {
        // Find the closest falling note that matches
        let closestNote = null;
        let closestDist = Infinity;
        
        for (const fn of this.fallingNotes) {
            if (fn.note === note && !fn.hit && !fn.missed) {
                const key = this.keys.find(k => k.note === note);
                if (key) {
                    const dist = Math.abs(fn.y - key.y);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestNote = fn;
                    }
                }
            }
        }
        
        if (closestNote) {
            const key = this.keys.find(k => k.note === note);
            const targetY = key ? key.y : this.canvas.height - this.keyHeight;
            const tolerance = 60; // pixels tolerance
            
            if (closestDist < tolerance) {
                // Perfect hit!
                closestNote.hit = true;
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                this.score += 100 + this.combo * 20;
                
                this._showFeedback('PERFECT!', '#00ff88', 300);
                this._spawnParticles(note, 20); // More particles for perfect
                
                if (window.soundManager) {
                    window.soundManager.playScore();
                }
            } else if (closestDist < tolerance * 2) {
                // Good hit
                closestNote.hit = true;
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                this.score += 50 + this.combo * 10;
                
                this._showFeedback('GOOD!', '#ffcc00', 200);
                this._spawnParticles(note, 10);
                
                if (window.soundManager) {
                    window.soundManager.playScore();
                }
            } else {
                // Missed - too early or too late
                this.combo = 0;
                this.lives--;
                closestNote.missed = true;
                
                this._showFeedback('MISS!', '#ff4466', 200);
                
                if (window.soundManager) {
                    window.soundManager.playHit();
                }
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                }
            }
        }
    }
    
    _showFeedback(text, color, score) {
        this.feedback.push({
            text: text,
            color: color,
            score: score,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            life: 1,
            scale: 1.5
        });
    }
    
    update(dt) {
        if (this.gameOver) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (!p.isGlow) {
                p.vy += 500 * dt;
            }
            p.life -= dt * (p.decay || 2);
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.mode === 'challenge') {
            this.challengeTimer += dt * 1000;

            // Spawn new falling notes
            for (let i = this.challengeNotes.length - 1; i >= 0; i--) {
                const note = this.challengeNotes[i];
                if (!note.spawned && this.challengeTimer >= note.spawnTime) {
                    this.fallingNotes.push({
                        ...note,
                        spawned: true
                    });
                    note.spawned = true; // Mark as spawned in challengeNotes
                }
            }

            // Update and check falling notes
            for (let i = this.fallingNotes.length - 1; i >= 0; i--) {
                const note = this.fallingNotes[i];
                note.y += note.vy * dt;

                // Check if missed
                const key = this.keys.find(k => k.note === note.note);
                if (key && !note.hit && !note.missed && note.y > key.y + key.height) {
                    note.missed = true;
                    this.combo = 0;
                    this.lives--;
                    this._showFeedback('MISS!', '#ff4466', 200);
                    if (window.soundManager) window.soundManager.playHit();
                    if (this.lives <= 0) {
                        this.gameOver = true;
                    }
                }

                // Remove if off-screen and missed or hit
                if (note.y > this.canvas.height || note.hit) {
                    this.fallingNotes.splice(i, 1);
                }
            }

            // Check if all challenge notes have been processed
            if (this.challengeNotes.every(note => note.spawned && (this.fallingNotes.find(f => f.note === note.note && f.spawnTime === note.spawnTime) === undefined))) {
                this._startChallenge(); // Restart challenge
            }
        }

        // Update feedback animations
        for (let i = this.feedback.length - 1; i >= 0; i--) {
            const f = this.feedback[i];
            f.y -= 30 * dt;
            f.life -= dt * 1.5;
            f.scale = Math.max(1, f.scale - dt * 0.5);
            
            if (f.life <= 0) {
                this.feedback.splice(i, 1);
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#050512';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this._drawBackground();
        this._drawKeys();
        this._drawParticles();
        this._drawFallingNotes();
        this._drawFeedback();
        
        if (this.mode === 'challenge') {
            this._drawChallengeUI();
        }
        
        this._drawModeIndicator();
    }
    
    _drawBackground() {
        const ctx = this.ctx;
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }
    
    _drawKeys() {
        const ctx = this.ctx;
        
        for (const key of this.keys) {
            const isActive = this.activeKeys.has(key.note);
            
            if (key.isBlack) {
                const gradient = ctx.createLinearGradient(key.x, key.y, key.x, key.y + key.height);
                
                if (isActive) {
                    gradient.addColorStop(0, '#ff00aa');
                    gradient.addColorStop(1, '#aa0066');
                    
                    // Neon glow for active black keys
                    ctx.shadowColor = '#ff00aa';
                    ctx.shadowBlur = 30;
                } else {
                    gradient.addColorStop(0, '#2a2a4e');
                    gradient.addColorStop(1, '#1a1a2e');
                }
                
                ctx.fillStyle = gradient;
                ctx.fillRect(key.x, key.y, key.width, key.height);
                
                ctx.shadowBlur = 0;
                
                // Highlight edge
                ctx.strokeStyle = isActive ? '#ff66cc' : '#3a3a5e';
                ctx.lineWidth = isActive ? 2 : 1;
                ctx.strokeRect(key.x, key.y, key.width, key.height);
            }
        }
        
        for (const key of this.keys) {
            if (!key.isBlack) {
                const isActive = this.activeKeys.has(key.note);
                
                const gradient = ctx.createLinearGradient(key.x, key.y, key.x, key.y + key.height);
                
                if (isActive) {
                    gradient.addColorStop(0, '#00d4ff');
                    gradient.addColorStop(1, '#0088aa');
                    
                    // Neon glow for active white keys
                    ctx.shadowColor = '#00d4ff';
                    ctx.shadowBlur = 25;
                } else {
                    gradient.addColorStop(0, '#ffffff');
                    gradient.addColorStop(1, '#cccccc');
                }
                
                ctx.fillStyle = gradient;
                ctx.fillRect(key.x + 2, key.y, key.width - 4, key.height);
                
                ctx.shadowBlur = 0;
                
                ctx.strokeStyle = isActive ? '#00ffff' : '#aaaaaa';
                ctx.lineWidth = isActive ? 2 : 1;
                ctx.strokeRect(key.x + 2, key.y, key.width - 4, key.height);
                
                if (!isActive) {
                    ctx.fillStyle = '#666666';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    const displayKey = this.displayKeyMap[key.note];
                    if (displayKey) {
                        ctx.fillText(displayKey, key.x + key.width / 2, key.y + key.height - 20);
                    }
                }
            }
        }
    }
    
    _drawParticles() {
        const ctx = this.ctx;
        
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            
            if (p.isGlow) {
                // Glow particle - radial gradient
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = p.color;
            }
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    _drawFallingNotes() {
        const ctx = this.ctx;

        for (const note of this.fallingNotes) {
            if (!note.hit && !note.missed) {
                ctx.fillStyle = note.color;
            } else if (note.hit) {
                ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
            } else if (note.missed) {
                ctx.fillStyle = 'rgba(255, 68, 102, 0.7)';
            }
            ctx.fillRect(note.x - note.width / 2, note.y, note.width, note.height);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(note.x - note.width / 2, note.y, note.width, note.height);
        }
    }

    _drawFeedback() {
        const ctx = this.ctx;

        for (const f of this.feedback) {
            ctx.globalAlpha = f.life;
            ctx.fillStyle = f.color;
            ctx.font = `bold ${24 * f.scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.shadowColor = f.color;
            ctx.shadowBlur = 15;
            ctx.fillText(f.text, f.x, f.y);
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
    }
    
    _drawChallengeUI() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, 40);
        
        ctx.fillStyle = '#ff00aa';
        ctx.fillText(`COMBO: ${this.combo}`, this.canvas.width / 2, 70);
        
        // Draw lives
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ff4466';
        ctx.font = 'bold 20px Arial';
        let hearts = '';
        for (let i = 0; i < this.lives; i++) hearts += '❤';
        ctx.fillText(`LIVES: ${hearts}`, 20, 70);
        
        const targetNote = this.challengeNotes.find(n => !n.hit && n.spawned);
        if (targetNote) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Arial';
            const noteName = targetNote.note.replace('s', '#');
            ctx.fillText(`NEXT: ${noteName}`, this.canvas.width / 2, 120);
            
            const key = this.keys.find(k => k.note === targetNote.note);
            if (key) {
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 3;
                ctx.strokeRect(key.x - 5, key.y - 5, key.width + 10, key.height + 10);
            }
        }

        // Draw game over screen
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            ctx.fillStyle = '#ff00aa';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Max Combo: ${this.maxCombo}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px Arial';
            ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 120);
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Progress: ${this.challengeIndex}/${this.challengeNotes.length}`, 20, 30);
    }
    
    _drawModeIndicator() {
        const ctx = this.ctx;
        
        ctx.fillStyle = this.mode === 'challenge' ? '#ff00aa' : '#00ff88';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(this.mode === 'challenge' ? '🎯 CHALLENGE MODE' : '🎹 FREE PLAY', this.canvas.width - 20, 30);
        
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.fillText('Press SPACE to toggle mode', this.canvas.width - 20, 50);
    }
    
    getScore() {
        return this.score;
    }
    
    isGameOver() {
        return this.gameOver;
    }
    
    destroy() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
        if (this._mouseHandler) {
            this.canvas.removeEventListener('mousedown', this._mouseHandler);
        }
        // Clean up note off handlers
        if (this._noteOffHandlers) {
            for (const freq in this._noteOffHandlers) {
                if (this._noteOffHandlers[freq]) {
                    this._noteOffHandlers[freq]();
                }
            }
            this._noteOffHandlers = {};
        }
    }
    
    pause() {}
    resume() {}
}

if (window.gameManager) {
    window.gameManager.registerGame('piano', NeonPiano, {
        name: 'Neon Piano',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
