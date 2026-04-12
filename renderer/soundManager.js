// Sound Manager v4.0 - Premium 8-Bit Procedural Music & SFX Engine
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.volume = parseFloat(localStorage.getItem('lg_volume') || '0.5');
        this.updateVolume(this.volume);
        this.enabled = true;

        // Music state
        this._musicGain = this.ctx.createGain();
        this._musicGain.gain.value = 0.25; // Music head-room
        this._musicGain.connect(this.masterGain);
        this._musicTimers = [];
        this._musicPlaying = false;
        this._currentMusicId = null;

        // Note frequency map
        this._NOTE_FREQ = {
            'C2': 65.41, 'Cs2': 69.30, 'D2': 73.42, 'Ds2': 77.78, 'E2': 82.41, 'F2': 87.31, 'Fs2': 92.50, 'G2': 98.00, 'Gs2': 103.83, 'A2': 110.00, 'As2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'Cs3': 138.59, 'D3': 146.83, 'Ds3': 155.56, 'E3': 164.81, 'F3': 174.61, 'Fs3': 185.00, 'G3': 196.00, 'Gs3': 207.65, 'A3': 220.00, 'As3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'Cs4': 277.18, 'D4': 293.66, 'Ds4': 311.13, 'E4': 329.63, 'F4': 349.23, 'Fs4': 369.99, 'G4': 392.00, 'Gs4': 415.30, 'A4': 440.00, 'As4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'Cs5': 554.37, 'D5': 587.33, 'Ds5': 622.25, 'E5': 659.25, 'F5': 698.46, 'Fs5': 739.99, 'G5': 783.99, 'Gs5': 830.61, 'A5': 880.00, 'As5': 932.33, 'B5': 987.77,
            'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51
        };
    }

    updateVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
        }
        // Update music gain to scale with volume slider
        if (this._musicGain) {
            this._musicGain.gain.setTargetAtTime(0.5 * this.volume, this.ctx.currentTime, 0.05);
        }
    }

    setVolume(v) { this.updateVolume(v); }
    setEnabled(e) { this.enabled = !!e; }

    // ==================== MUSIC ENGINE ====================

    startMusic(gameId) {
        if (!this.enabled || !this.ctx) return;
        if (this._musicPlaying && this._currentMusicId === gameId) return;
        this.stopMusic();
        this._currentMusicId = gameId;
        this._musicPlaying = true;

        const theme = this._getTheme(gameId);
        if (!theme) return;

        this._playMusicLoop(theme);
    }

    stopMusic() {
        this._musicPlaying = false;
        this._currentMusicId = null;
        this._musicTimers.forEach(id => clearTimeout(id));
        this._musicTimers = [];
    }

    _playMusicLoop(theme) {
        if (!this._musicPlaying) return;
        const { notes, tempo, wave, wave2, bass, percussion } = theme;
        const beatLen = 60 / tempo;
        const totalDuration = notes.length * beatLen * 1000;

        // Melody
        notes.forEach((note, i) => {
            const tid = setTimeout(() => {
                if (!this._musicPlaying) return;
                if (note !== '-') {
                    const freq = this._NOTE_FREQ[note];
                    if (freq) this._playMusicNote(freq, wave || 'square', beatLen * 0.8, 0.2);
                }
            }, i * beatLen * 1000);
            this._musicTimers.push(tid);
        });

        // Bass
        if (bass) {
            bass.forEach((note, i) => {
                const tid = setTimeout(() => {
                    if (!this._musicPlaying) return;
                    if (note !== '-') {
                        const freq = this._NOTE_FREQ[note];
                        if (freq) this._playMusicNote(freq, wave2 || 'triangle', beatLen * 0.9, 0.15);
                    }
                }, i * beatLen * 1000);
                this._musicTimers.push(tid);
            });
        }

        // Percussion
        if (percussion) {
            percussion.forEach((hit, i) => {
                const tid = setTimeout(() => {
                    if (!this._musicPlaying) return;
                    if (hit === 'x') this._playMusicPercussion(0.04, 0.08); // Kick/Snare
                    if (hit === 'o') this._playMusicPercussion(0.01, 0.04); // Hat
                }, i * beatLen * 1000);
                this._musicTimers.push(tid);
            });
        }

        const loopTid = setTimeout(() => {
            if (this._musicPlaying) this._playMusicLoop(theme);
        }, totalDuration);
        this._musicTimers.push(loopTid);
    }

    _playMusicNote(freq, type, duration, vol) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        // Vibrato
        const vibrato = this.ctx.createOscillator();
        const vGain = this.ctx.createGain();
        vibrato.frequency.value = 5 + Math.random();
        vGain.gain.value = freq * 0.008;
        vibrato.connect(vGain);
        vGain.connect(osc.frequency);
        vibrato.start(now);
        vibrato.stop(now + duration);

        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this._musicGain);
        osc.start(now);
        osc.stop(now + duration);
    }

    _playMusicPercussion(duration, vol) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        source.connect(gain);
        gain.connect(this._musicGain);
        source.start(now);
    }

    _getTheme(gameId) {
        const T = {
            snake: {
                tempo: 120, wave: 'square', wave2: 'triangle',
                notes: ['E3', 'F3', 'G3', 'F3', 'Ab3', 'G3', 'F3', 'E3'],
                bass: ['E2', '-', 'F2', '-', 'Ab2', '-', 'G2', '-'],
                percussion: ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o']
            },
            tetris: {
                tempo: 160, wave: 'square', wave2: 'triangle',
                notes: ['E5', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', '-', 'A4', 'C5', 'E5', 'D5', 'C5', 'B4', '-', 'C5', 'D5', 'E5', 'C5', 'A4'],
                bass: ['A3', '-', 'E3', '-', 'A3', '-', 'E3', '-', 'A3', '-', 'E3', '-', 'A3', '-', 'E3', '-', 'D3', '-', 'A2', '-'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-', 'x', '-', 'o', '-', 'x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            space: {
                tempo: 150, wave: 'sawtooth', wave2: 'square',
                notes: ['C4', 'G4', 'C5', 'G4', 'Eb4', 'G4', 'C5', 'D5'],
                bass: ['C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            flappy: {
                tempo: 140, wave: 'triangle', wave2: 'square',
                notes: ['G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5'],
                bass: ['C3', '-', 'G3', '-', 'C3', '-', 'G3', '-'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            minesweeper: {
                tempo: 80, wave: 'sine', wave2: 'triangle',
                notes: ['G4', '-', 'F4', '-', 'E4', '-', 'D4', '-'],
                bass: ['C3', '-', '-', '-', 'Bb2', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            pong: {
                tempo: 130, wave: 'square', wave2: 'square',
                notes: ['A4', '-', 'E4', '-', 'A4', '-', 'E4', 'A4'],
                bass: ['A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2'],
                percussion: ['x', '-', '-', '-', 'x', '-', '-', '-']
            },
            breakout: {
                tempo: 145, wave: 'sawtooth', wave2: 'triangle',
                notes: ['D4', 'F4', 'A4', 'D5', 'C5', 'A4', 'F4', 'E4'],
                bass: ['D3', '-', 'F3', '-', 'C3', '-', 'A2', '-'],
                percussion: ['x', 'x', 'o', '-', 'x', '-', 'o', '-']
            },
            asteroids: {
                tempo: 110, wave: 'sawtooth', wave2: 'square',
                notes: ['E4', 'B3', 'A3', 'G3', 'F3', 'D3', 'C3', 'B2'],
                bass: ['E2', '-', '-', '-', 'A2', '-', '-', '-'],
                percussion: ['x', '-', 'o', '-', 'x', 'x', 'o', '-']
            },
            frogger: {
                tempo: 140, wave: 'square', wave2: 'triangle',
                notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', '-'],
                bass: ['C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2'],
                percussion: ['x', '-', 'o', 'x', '-', 'o', 'x', '-']
            },
            memory: {
                tempo: 100, wave: 'sine', wave2: 'triangle',
                notes: ['C5', 'E5', 'G5', 'B5', 'C6', 'B5', 'G5', '-'],
                bass: ['C3', '-', '-', '-', 'F3', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            tictactoe: {
                tempo: 90, wave: 'triangle', wave2: 'sine',
                notes: ['G4', 'B4', 'D5', 'F#5', 'G5', 'F#5', 'D5', 'B4'],
                bass: ['G2', '-', '-', '-', 'C3', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            whackamole: {
                tempo: 175, wave: 'square', wave2: 'sawtooth',
                notes: ['C5', 'Db5', 'Eb5', 'Gb5', 'F5', 'Eb5', 'Db5', 'C5'],
                bass: ['C3', 'C3', 'G2', 'G2', 'Ab2', 'Ab2', 'Eb2', 'Eb2'],
                percussion: ['x', 'x', 'o', 'x', 'o', 'x', 'x', 'o']
            },
            doodlejump: {
                tempo: 145, wave: 'triangle', wave2: 'square',
                notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', '-'],
                bass: ['C3', '-', 'G3', '-', 'D3', '-', 'A3', '-'],
                percussion: ['o', '-', 'o', '-', 'o', '-', 'o', '-']
            },
            simon: {
                tempo: 110, wave: 'square', wave2: 'triangle',
                notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'],
                bass: ['D2', 'A2', 'D2', 'A2', 'G2', 'D2', 'A2', 'E2'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            runner: {
                tempo: 180, wave: 'sawtooth', wave2: 'square',
                notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'B4', 'E4'],
                bass: ['E2', 'E2', 'F2', 'F2', 'G2', 'G2', 'E2', 'E2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            game2048: {
                tempo: 95, wave: 'sine', wave2: 'triangle',
                notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'G4', 'E4', '-'],
                bass: ['C3', '-', 'G3', '-', 'A3', '-', 'F3', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            orbcollector: {
                tempo: 135, wave: 'square', wave2: 'triangle',
                notes: ['G4', 'B4', 'D5', 'F5', 'E5', 'C5', 'G4', '-'],
                bass: ['G2', 'D3', 'G2', 'D3', 'F2', 'C3', 'F2', 'C3'],
                percussion: ['x', '-', 'o', 'x', 'x', '-', 'o', '-']
            },
            skyfall: {
                tempo: 120, wave: 'sine', wave2: 'triangle',
                notes: ['A5', 'G5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4'],
                bass: ['A2', '-', 'F2', '-', 'D2', '-', 'E2', '-'],
                percussion: ['o', '-', 'o', '-', 'o', '-', 'o', '-']
            },
            lasergrid: {
                tempo: 140, wave: 'sawtooth', wave2: 'square',
                notes: ['C4', 'Eb4', 'Fs4', 'A4', 'C5', 'A4', 'Fs4', 'Eb4'],
                bass: ['C2', 'C2', 'C2', 'C2', 'D2', 'D2', 'D2', 'D2'],
                percussion: ['x', 'x', 'o', 'o', 'x', 'x', 'o', 'o']
            },
            orbit: {
                tempo: 105, wave: 'sine', wave2: 'triangle',
                notes: ['F4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5', '-'],
                bass: ['F2', '-', 'G2', '-', 'F2', '-', 'G2', '-'],
                percussion: ['o', '-', '-', 'o', '-', '-', 'o', '-']
            },
            stacker: {
                tempo: 130, wave: 'square', wave2: 'square',
                notes: ['C4', 'E4', 'G4', 'C4', 'D4', 'F4', 'A4', 'D4'],
                bass: ['C3', 'G2', 'C3', 'G2', 'D3', 'A2', 'D3', 'A2'],
                percussion: ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o']
            },
            colorrush: {
                tempo: 160, wave: 'square', wave2: 'triangle',
                notes: ['C5', 'G5', 'A5', 'F5', 'G5', 'E5', 'F5', 'D5'],
                bass: ['C3', 'G2', 'F2', 'C3', 'G2', 'E2', 'F2', 'D2'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
        cyberdash: {
                tempo: 185, wave: 'sawtooth', wave2: 'sawtooth',
                notes: ['A4', 'E5', 'A4', 'G5', 'A4', 'F5', 'A4', 'G5'],
                bass: ['A2', 'A2', 'A2', 'A2', 'D2', 'D2', 'D2', 'D2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            space: {
                tempo: 150, wave: 'sawtooth', wave2: 'square',
                notes: ['C4', 'G4', 'C5', 'G4', 'Eb4', 'G4', 'C5', 'D5'],
                bass: ['C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            flappy: {
                tempo: 140, wave: 'triangle', wave2: 'square',
                notes: ['G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5'],
                bass: ['C3', '-', 'G3', '-', 'C3', '-', 'G3', '-'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            minesweeper: {
                tempo: 80, wave: 'sine', wave2: 'triangle',
                notes: ['G4', '-', 'F4', '-', 'E4', '-', 'D4', '-'],
                bass: ['C3', '-', '-', '-', 'Bb2', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            pong: {
                tempo: 130, wave: 'square', wave2: 'square',
                notes: ['A4', '-', 'E4', '-', 'A4', '-', 'E4', 'A4'],
                bass: ['A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2'],
                percussion: ['x', '-', '-', '-', 'x', '-', '-', '-']
            },
            breakout: {
                tempo: 145, wave: 'sawtooth', wave2: 'triangle',
                notes: ['D4', 'F4', 'A4', 'D5', 'C5', 'A4', 'F4', 'E4'],
                bass: ['D3', '-', 'F3', '-', 'C3', '-', 'A2', '-'],
                percussion: ['x', 'x', 'o', '-', 'x', '-', 'o', '-']
            },
            asteroids: {
                tempo: 110, wave: 'sawtooth', wave2: 'square',
                notes: ['E4', 'B3', 'A3', 'G3', 'F3', 'D3', 'C3', 'B2'],
                bass: ['E2', '-', '-', '-', 'A2', '-', '-', '-'],
                percussion: ['x', '-', 'o', '-', 'x', 'x', 'o', '-']
            },
            frogger: {
                tempo: 140, wave: 'square', wave2: 'triangle',
                notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', '-'],
                bass: ['C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2'],
                percussion: ['x', '-', 'o', 'x', '-', 'o', 'x', '-']
            },
            memory: {
                tempo: 100, wave: 'sine', wave2: 'triangle',
                notes: ['C5', 'E5', 'G5', 'B5', 'C6', 'B5', 'G5', '-'],
                bass: ['C3', '-', '-', '-', 'F3', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            tictactoe: {
                tempo: 90, wave: 'triangle', wave2: 'sine',
                notes: ['G4', 'B4', 'D5', 'F#5', 'G5', 'F#5', 'D5', 'B4'],
                bass: ['G2', '-', '-', '-', 'C3', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            pianogame: {
                tempo: 120, wave: 'sine', wave2: 'square',
                notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'G4', 'E4'],
                bass: ['C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2'],
                percussion: ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o']
            },
            piano: {
                tempo: 120, wave: 'sine', wave2: 'square',
                notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'G4', 'E4'],
                bass: ['C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2'],
                percussion: ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o']
            },
            whackamole: {
                tempo: 175, wave: 'square', wave2: 'sawtooth',
                notes: ['C5', 'Db5', 'Eb5', 'Gb5', 'F5', 'Eb5', 'Db5', 'C5'],
                bass: ['C3', 'C3', 'G2', 'G2', 'Ab2', 'Ab2', 'Eb2', 'Eb2'],
                percussion: ['x', 'x', 'o', 'x', 'o', 'x', 'x', 'o']
            },
            doodlejump: {
                tempo: 145, wave: 'triangle', wave2: 'square',
                notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', '-'],
                bass: ['C3', '-', 'G3', '-', 'D3', '-', 'A3', '-'],
                percussion: ['o', '-', 'o', '-', 'o', '-', 'o', '-']
            },
            simon: {
                tempo: 110, wave: 'square', wave2: 'triangle',
                notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'],
                bass: ['D2', 'A2', 'D2', 'A2', 'G2', 'D2', 'A2', 'E2'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            runner: {
                tempo: 180, wave: 'sawtooth', wave2: 'square',
                notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'B4', 'E4'],
                bass: ['E2', 'E2', 'F2', 'F2', 'G2', 'G2', 'E2', 'E2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            game2048: {
                tempo: 95, wave: 'sine', wave2: 'triangle',
                notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'G4', 'E4', '-'],
                bass: ['C3', '-', 'G3', '-', 'A3', '-', 'F3', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            orbcollector: {
                tempo: 135, wave: 'square', wave2: 'triangle',
                notes: ['G4', 'B4', 'D5', 'F5', 'E5', 'C5', 'G4', '-'],
                bass: ['G2', 'D3', 'G2', 'D3', 'F2', 'C3', 'F2', 'C3'],
                percussion: ['x', '-', 'o', 'x', 'x', '-', 'o', '-']
            },
            skyfall: {
                tempo: 120, wave: 'sine', wave2: 'triangle',
                notes: ['A5', 'G5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4'],
                bass: ['A2', '-', 'F2', '-', 'D2', '-', 'E2', '-'],
                percussion: ['o', '-', 'o', '-', 'o', '-', 'o', '-']
            },
            lasergrid: {
                tempo: 140, wave: 'sawtooth', wave2: 'square',
                notes: ['C4', 'Eb4', 'Fs4', 'A4', 'C5', 'A4', 'Fs4', 'Eb4'],
                bass: ['C2', 'C2', 'C2', 'C2', 'D2', 'D2', 'D2', 'D2'],
                percussion: ['x', 'x', 'o', 'o', 'x', 'x', 'o', 'o']
            },
            orbit: {
                tempo: 105, wave: 'sine', wave2: 'triangle',
                notes: ['F4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5', '-'],
                bass: ['F2', '-', 'G2', '-', 'F2', '-', 'G2', '-'],
                percussion: ['o', '-', '-', 'o', '-', '-', 'o', '-']
            },
            stacker: {
                tempo: 130, wave: 'square', wave2: 'square',
                notes: ['C4', 'E4', 'G4', 'C4', 'D4', 'F4', 'A4', 'D4'],
                bass: ['C3', 'G2', 'C3', 'G2', 'D3', 'A2', 'D3', 'A2'],
                percussion: ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o']
            },
            colorrush: {
                tempo: 160, wave: 'square', wave2: 'triangle',
                notes: ['C5', 'G5', 'A5', 'F5', 'G5', 'E5', 'F5', 'D5'],
                bass: ['C3', 'G2', 'F2', 'C3', 'G2', 'E2', 'F2', 'D2'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            cyberdash: {
                tempo: 185, wave: 'sawtooth', wave2: 'sawtooth',
                notes: ['A4', 'E5', 'A4', 'G5', 'A4', 'F5', 'A4', 'G5'],
                bass: ['A2', 'A2', 'A2', 'A2', 'D2', 'D2', 'D2', 'D2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            neonduel: {
                tempo: 155, wave: 'square', wave2: 'sawtooth',
                notes: ['E4', 'G4', 'A4', 'B4', 'D4', 'F4', 'G4', 'A4'],
                bass: ['E2', 'B2', 'E2', 'B2', 'D2', 'A2', 'D2', 'A2'],
                percussion: ['x', 'o', 'x', 'x', 'o', 'x', 'o', 'o']
            },
            blaster: {
                tempo: 165, wave: 'sawtooth', wave2: 'square',
                notes: ['C5', 'E5', 'G5', 'C6', 'B4', 'G4', 'A4', 'G4'],
                bass: ['C3', 'G2', 'C3', 'G2', 'G2', 'D2', 'G2', 'D2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            pixelquest: {
                tempo: 135, wave: 'square', wave2: 'triangle',
                notes: ['C4', 'G4', 'A4', 'F4', 'G4', 'E4', 'F4', 'D4'],
                bass: ['C3', '-', 'G2', '-', 'A2', '-', 'F2', '-'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            wordquest: {
                tempo: 110, wave: 'triangle', wave2: 'sine',
                notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4'],
                bass: ['G2', '-', 'C3', '-', 'G2', '-', 'C3', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            bouncy: {
                tempo: 145, wave: 'triangle', wave2: 'square',
                notes: ['C5', 'A4', 'G4', 'A4', 'C5', 'D5', 'E5', '-'],
                bass: ['C3', 'G2', 'A2', 'F2', 'C3', 'G2', 'A2', 'F2'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            rhythmtap: {
                tempo: 150, wave: 'square', wave2: 'triangle',
                notes: ['E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'E4', '-'],
                bass: ['E3', 'E3', 'E3', 'E3', 'A2', 'A2', 'A2', 'A2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            jewels: {
                tempo: 125, wave: 'sine', wave2: 'triangle',
                notes: ['A5', 'C6', 'E6', '-', 'G5', 'B5', 'D6', '-'],
                bass: ['A3', '-', '-', '-', 'G3', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            ninja: {
                tempo: 140, wave: 'sawtooth', wave2: 'triangle',
                notes: ['E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'E4', 'D4'],
                bass: ['E2', '-', 'A2', '-', 'B2', '-', 'E2', '-'],
                percussion: ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o']
            },
            neonduel: {
                tempo: 155, wave: 'square', wave2: 'sawtooth',
                notes: ['E4', 'G4', 'A4', 'B4', 'D4', 'F4', 'G4', 'A4'],
                bass: ['E2', 'B2', 'E2', 'B2', 'D2', 'A2', 'D2', 'A2'],
                percussion: ['x', 'o', 'x', 'x', 'o', 'x', 'o', 'o']
            },
            blaster: {
                tempo: 165, wave: 'sawtooth', wave2: 'square',
                notes: ['C5', 'E5', 'G5', 'C6', 'B4', 'G4', 'A4', 'G4'],
                bass: ['C3', 'G2', 'C3', 'G2', 'G2', 'D2', 'G2', 'D2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            pixelquest: {
                tempo: 135, wave: 'square', wave2: 'triangle',
                notes: ['C4', 'G4', 'A4', 'F4', 'G4', 'E4', 'F4', 'D4'],
                bass: ['C3', '-', 'G2', '-', 'A2', '-', 'F2', '-'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            wordquest: {
                tempo: 110, wave: 'triangle', wave2: 'sine',
                notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4'],
                bass: ['G2', '-', 'C3', '-', 'G2', '-', 'C3', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            bouncy: {
                tempo: 145, wave: 'triangle', wave2: 'square',
                notes: ['C5', 'A4', 'G4', 'A4', 'C5', 'D5', 'E5', '-'],
                bass: ['C3', 'G2', 'A2', 'F2', 'C3', 'G2', 'A2', 'F2'],
                percussion: ['x', '-', 'o', '-', 'x', '-', 'o', '-']
            },
            rhythmtap: {
                tempo: 150, wave: 'square', wave2: 'triangle',
                notes: ['E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'E4', '-'],
                bass: ['E3', 'E3', 'E3', 'E3', 'A2', 'A2', 'A2', 'A2'],
                percussion: ['x', 'x', 'o', 'x', 'x', 'x', 'o', 'o']
            },
            jewels: {
                tempo: 125, wave: 'sine', wave2: 'triangle',
                notes: ['A5', 'C6', 'E6', '-', 'G5', 'B5', 'D6', '-'],
                bass: ['A3', '-', '-', '-', 'G3', '-', '-', '-'],
                percussion: ['o', '-', '-', '-', 'o', '-', '-', '-']
            },
            ninja: {
                tempo: 140, wave: 'sawtooth', wave2: 'triangle',
                notes: ['E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'E4', 'D4'],
                bass: ['E2', '-', 'A2', '-', 'B2', '-', 'E2', '-'],
                percussion: ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o']
            }
        };
        return T[gameId] || T['snake'];
    }

    // ==================== SFX LIBRARY ====================
    playClick() { this._playTone(440, 'triangle', 0.05, 0.4); }
    playHover() { this._playTone(880, 'sine', 0.02, 0.1); }
    playSelect() { this._playTone(660, 'square', 0.1, 0.2); }
    playShow() { this._playSweep(440, 880, 'sine', 0.2, 0.3); }
    playHide() { this._playSweep(880, 440, 'sine', 0.2, 0.3); }

    playAchievement() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            this._playTone(f, 'square', 0.2, 0.15, now + i * 0.1);
        });
    }

    playJump() { this._playSweep(200, 600, 'square', 0.08, 0.25); }
    playHit() { this._playNoise(0.08, 0.35); }
    playScore() { this._playTone(1000, 'square', 0.08, 0.2); }
    playDeath() { this._playSweep(400, 80, 'sawtooth', 0.5, 0.3); }
    playShoot() { this._playSweep(900, 200, 'square', 0.06, 0.15); }
    playExplosion() { this._playNoise(0.25, 0.4); }
    playLevelUp() { this._playSweep(400, 1200, 'square', 0.4, 0.25); }
    playEat() {
        const now = this.ctx.currentTime;
        this._playTone(500, 'square', 0.04, 0.2, now);
        this._playTone(800, 'square', 0.04, 0.2, now + 0.04);
    }
    playLineClear() {
        const now = this.ctx.currentTime;
        [523, 659, 784, 1047].forEach((f, i) => this._playTone(f, 'square', 0.15, 0.12, now + i * 0.03));
    }
    playCombo(n) {
        const base = 600 + Math.min(n, 10) * 80;
        const now = this.ctx.currentTime;
        this._playTone(base, 'square', 0.06, 0.2, now);
        this._playTone(base * 1.25, 'square', 0.06, 0.2, now + 0.06);
        this._playTone(base * 1.5, 'square', 0.06, 0.2, now + 0.12);
    }
    playPlace() { this._playTone(120, 'triangle', 0.1, 0.3); this._playNoise(0.04, 0.15); }
    playMove() { this._playTone(440, 'square', 0.02, 0.08); }
    playMatch() {
        const now = this.ctx.currentTime;
        [880, 1100, 1320].forEach((f, i) => this._playTone(f, 'sine', 0.12, 0.15, now + i * 0.06));
    }
    playWin() {
        const now = this.ctx.currentTime;
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this._playTone(f, 'square', 0.2, 0.18, now + i * 0.12));
    }
    playCountdown() { this._playTone(800, 'square', 0.05, 0.25); }
    playSlice() { this._playSweep(1200, 300, 'sawtooth', 0.08, 0.2); }
    playBounce() { this._playSweep(300, 600, 'triangle', 0.06, 0.2); }
    playPowerUp() {
        const now = this.ctx.currentTime;
        [400, 600, 800, 1000, 1200].forEach((f, i) => this._playTone(f, 'square', 0.08, 0.12, now + i * 0.05));
    }
    playLaser() { this._playSweep(1500, 200, 'sawtooth', 0.1, 0.15); }
    playFlip() { this._playTone(600, 'triangle', 0.04, 0.15); }
    playWhoosh() { this._playSweep(400, 800, 'sine', 0.06, 0.12); }
    playTick() { this._playTone(1000, 'square', 0.02, 0.1); }
    playDing() { this._playTone(1200, 'sine', 0.15, 0.2); }
    playBuzz() {
        const now = this.ctx.currentTime;
        this._playTone(150, 'sawtooth', 0.2, 0.2, now);
        this._playTone(140, 'sawtooth', 0.2, 0.15, now + 0.05);
    }
    playLand() { this._playTone(80, 'triangle', 0.08, 0.25); this._playNoise(0.03, 0.1); }
    playSwing() { this._playSweep(600, 1200, 'sawtooth', 0.05, 0.15); }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // NEON BRAWL - NEW SOUND EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════════════
    
    playKick() { this._playSweep(300, 150, 'square', 0.05, 0.25); }
    playBlock() { this._playSweep(200, 400, 'triangle', 0.08, 0.3); }
    playWhooshFast() { this._playSweep(600, 1200, 'sine', 0.04, 0.15); }
    playMetalClash() { 
        this._playNoise(0.1, 0.3); 
        this._playTone(800, 'square', 0.05, 0.3, this.ctx.currentTime);
    }
    playDragonRoar() { 
        const now = this.ctx.currentTime;
        [200, 180, 160, 140].forEach((f, i) => this._playTone(f, 'sawtooth', 0.15, 0.2, now + i * 0.08));
    }
    playWindSwoosh() { this._playSweep(800, 200, 'sine', 0.15, 0.2); }
    playBossEnter() { 
        const now = this.ctx.currentTime;
        [100, 150, 200, 300, 400].forEach((f, i) => this._playTone(f, 'sawtooth', 0.2, 0.25, now + i * 0.1));
    }
    playBossDeath() { 
        this._playSweep(400, 50, 'sawtooth', 0.6, 0.4);
        this._playNoise(0.4, 0.5);
    }
    playPowerupCollect() { 
        const now = this.ctx.currentTime;
        [523, 659, 784, 1047, 1318].forEach((f, i) => this._playTone(f, 'square', 0.08, 0.15, now + i * 0.04));
    }
    playHeal() { 
        const now = this.ctx.currentTime;
        [440, 550, 660, 880].forEach((f, i) => this._playTone(f, 'sine', 0.1, 0.12, now + i * 0.06));
    }
    playCounter() { this._playSweep(200, 800, 'square', 0.1, 0.3); }
    playThrow() { this._playSweep(400, 100, 'square', 0.08, 0.25); }
    playAirAttack() { this._playSweep(500, 250, 'square', 0.06, 0.2); }
    playRage() { 
        const now = this.ctx.currentTime;
        [100, 150, 200, 250, 300, 350, 400].forEach((f, i) => this._playTone(f, 'sawtooth', 0.1, 0.25, now + i * 0.05));
    }
    playFreeze() { this._playSweep(800, 300, 'sine', 0.3, 0.25); }
    playShield() { this._playSweep(400, 600, 'triangle', 0.1, 0.2); }
    playComboX(n) { 
        const base = 400 + n * 60;
        this._playTone(base, 'square', 0.05, 0.2, this.ctx.currentTime);
        this._playTone(base * 1.5, 'square', 0.05, 0.15, this.ctx.currentTime + 0.03);
    }

    // Music ducking - lower music volume when sound plays
    duckMusic(duration = 0.1) {
        if (!this._musicGain || !this.ctx) return;
        const now = this.ctx.currentTime;
        const originalVolume = this._musicGain.gain.value;
        
        // Duck: lower music volume
        this._musicGain.gain.cancelScheduledValues(now);
        this._musicGain.gain.setValueAtTime(this._musicGain.gain.value, now);
        this._musicGain.gain.linearRampToValueAtTime(originalVolume * 0.2, now + 0.02);
        
        // Restore: bring music back up
        this._musicGain.gain.linearRampToValueAtTime(originalVolume, now + duration);
    }

    // ==================== INTERNALS ====================
    _playTone(freq, type, duration, volScale = 1.0, startTime = null) {
        if (!this.enabled || !this.ctx) return;
        const now = startTime || this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(volScale, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration + 0.01);
    }

    _playSweep(startFreq, endFreq, type, duration, volScale = 1.0) {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        gain.gain.setValueAtTime(volScale, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration + 0.01);
    }

    _playNoise(duration, volScale = 1.0) {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(volScale, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start(now);
        source.stop(now + duration + 0.01);
    }
}

window.soundManager = new SoundManager();
