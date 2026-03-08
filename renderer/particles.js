// Background Particle System v3.0
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
        this.active = true;
    }

    update() {
        if (!this.active) return;
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around screen edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Slow down over time
        this.vx *= 0.999;
        this.vy *= 0.999;
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
        ctx.fill();
    }
}

class Pulse {
    constructor() {
        this.particles = [];
        this.active = false;
    }

    trigger(x, y, color) {
        this.active = true;
        this.particles = [];
        const particleCount = 12;
        const baseColor = color || [255, 204, 0];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 100 + Math.random() * 50;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 1,
                color: baseColor,
                size: 4 + Math.random() * 6
            });
        }
    }

    update(dt) {
        if (!this.active) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 2;
            p.vx *= 0.95;
            p.vy *= 0.95;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.particles.length === 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        
        for (const p of this.particles) {
            const opacity = p.life * (1 - p.life);
            ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 - p.life), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

let canvas, ctx, particles = [], animId = null;
let width = 0, height = 0;
let settingsCache = { reducedMotion: true };
let enableGlow = false;
let lastFrameTs = 0;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

function bindCanvas() {
    if (canvas && ctx) return true;
    canvas = document.getElementById('bg-particles');
    if (!canvas) return false;
    ctx = canvas.getContext('2d', { alpha: true });
    return !!ctx;
}

function resize() {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
}

function init() {
    if (!bindCanvas()) return;
    resize();
    particles = [];
    settingsCache = getSettings();
    enableGlow = !settingsCache.reducedMotion && (width * height) <= (1100 * 750);

    if (settingsCache.reducedMotion) {
        // In reduced motion mode, keep background static and ultra light
        const count = 8;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
        return;
    }

    // Hard cap on particle count to prevent performance issues
    const maxParticles = 24;
    const count = Math.min(Math.floor(Math.min(canvas.width, canvas.height) / 80), maxParticles);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animate(ts = 0) {
    if (!bindCanvas()) return;

    if (ts && ts - lastFrameTs < FRAME_MS) {
        animId = requestAnimationFrame(animate);
        return;
    }
    lastFrameTs = ts || lastFrameTs;
    
    // Clear canvas with semi-transparent background for trail effect
    ctx.fillStyle = 'rgba(5, 5, 18, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Update and draw particles
    for (const particle of particles) {
        particle.update();
        if (!particle.active) continue;

        // Inline draw for less overhead
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, ${particle.opacity})`;
        if (enableGlow) {
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 2;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
    }

    ctx.shadowBlur = 0;
    
    animId = requestAnimationFrame(animate);
}

function getSettings() {
    try {
        const settings = localStorage.getItem('lg_settings');
        return settings ? JSON.parse(settings) : { reducedMotion: true };
    } catch {
        return { reducedMotion: true };
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        animate();
    });
} else {
    init();
    animate();
}

// Resource management: Pause animation when window is hidden
if (window.electronAPI) {
    window.electronAPI.onWindowHiding(() => {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    });

    window.electronAPI.onWindowShowing(() => {
        if (!animId) {
            animate();
        }
    });
}

// Handle resize
const resizeObserver = new ResizeObserver(() => {
    resize();
    init(); // Re-init count on large resize
});
if (bindCanvas() && canvas.parentElement) {
    resizeObserver.observe(canvas.parentElement);
}

// Cleanup function for proper resource management
function cleanup() {
    if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    particles = [];
}

// Export for external access
window.particleSystem = {
    cleanup,
    reset: init,
    isRunning: () => animId !== null
};