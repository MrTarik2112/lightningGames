/**
 * Lightning Games - Advanced Interactive Tutorial System
 * Version 3.6.0
 * 
 * A comprehensive, beautifully animated tutorial that guides users through
 * all features of Lightning Games with interactive steps, spotlight effects,
 * and smooth animations.
 */

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.steps = this.initializeSteps();
        this.tutorialContainer = null;
        this.spotlightElement = null;
        this.tooltipElement = null;
        this.progressBar = null;
        this.keyboardHints = null;
        this.confettiParticles = [];
        this.animationFrameId = null;
        this.loadProgress();
    }

    initializeSteps() {
        return [
            {
                title: "Welcome to Lightning Games! ⚡",
                description: "This interactive tutorial will guide you through all the amazing features of Lightning Games. You'll learn how to play games, track achievements, customize themes, and much more!",
                target: null,
                position: "center",
                action: "intro",
                keyboardShortcuts: [
                    { key: "→", action: "Next Step" },
                    { key: "←", action: "Previous Step" },
                    { key: "Esc", action: "Exit Tutorial" }
                ]
            },
            {
                title: "🎮 Game Gallery",
                description: "This is your game library! You can see all 60 games available. Each card shows the game name, icon, and description. Click any card to start playing immediately.",
                target: ".games-grid",
                position: "bottom",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "↑↓←→", action: "Navigate Games" },
                    { key: "Enter", action: "Play Selected" },
                    { key: "/", action: "Search" }
                ]
            },
            {
                title: "⭐ Favorites System",
                description: "Click the star icon on any game card to add it to your favorites. Your favorite games will appear at the top for quick access. You can manage favorites from the 'Favorites' tab.",
                target: ".game-card",
                position: "top",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "F", action: "Toggle Favorite" },
                    { key: "Click ⭐", action: "Add to Favorites" }
                ]
            },
            {
                title: "🔍 Search & Filter",
                description: "Use the search bar to find games by name. You can also filter by category using the tabs: All, Favorites, Arcade, Puzzle, and Classic. Try searching for 'snake' or 'tetris'!",
                target: "#game-search",
                position: "bottom",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "/", action: "Focus Search" },
                    { key: "Esc", action: "Clear Search" },
                    { key: "1-6", action: "Jump to Category" }
                ]
            },
            {
                title: "🎲 Random Game",
                description: "Feeling adventurous? Click the dice button to launch a random game! This is perfect when you can't decide what to play. You can also press 'R' to trigger this.",
                target: "#btn-random",
                position: "bottom",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "R", action: "Random Game" }
                ]
            },
            {
                title: "📊 Statistics Dashboard",
                description: "Click the 'Stats' tab to view your lifetime statistics: total games played, achievements unlocked, favorite count, and total playtime. This shows your gaming journey!",
                target: ".tab-controls",
                position: "top",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "Tab", action: "Switch Tabs" }
                ]
            },
            {
                title: "🏆 Achievements System",
                description: "Unlock achievements by completing specific tasks in games. You can view all achievements in the Stats tab. Achievements are categorized by rarity: Normal, Ultra, Legendary, and Hidden.",
                target: "#achievements-list",
                position: "top",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "Tab", action: "View Achievements" }
                ]
            },
            {
                title: "🎨 Theme Customization",
                description: "Open Settings (⚙️) and choose from 11 beautiful themes: Neon, Retro, Minimal, Forest, Ocean, Sunset, Purple, Matrix, Cyberpunk, Dark Blue, and Fire. Themes change instantly!",
                target: "#btn-settings",
                position: "bottom",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "S", action: "Open Settings" }
                ]
            },
            {
                title: "🔊 Audio Control",
                description: "Adjust the master volume using the slider in the top-right corner. You can also control individual sound effects and music volumes in Settings. All audio is synthesized in real-time!",
                target: ".volume-control",
                position: "bottom",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "Volume Slider", action: "Adjust Master Volume" }
                ]
            },
            {
                title: "⚙️ Advanced Settings",
                description: "Settings panel includes: Visual Effects (particles, glow, animations), Audio (SFX, music volumes), Gameplay (difficulty, auto-pause), Interface (card size, grid layout), and Data Management (export/import).",
                target: ".settings-panel",
                position: "left",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "S", action: "Toggle Settings" },
                    { key: "Esc", action: "Close Settings" }
                ]
            },
            {
                title: "🎮 Playing a Game",
                description: "When you start a game, you'll see the game canvas with your current score and best score. Use arrow keys or WASD to control your character. Press ESC to return to the launcher.",
                target: "#game-canvas",
                position: "center",
                action: "info",
                keyboardShortcuts: [
                    { key: "↑↓←→", action: "Move Character" },
                    { key: "Space", action: "Jump/Action" },
                    { key: "Esc", action: "Exit Game" }
                ]
            },
            {
                title: "🌍 Global Hotkey",
                description: "Press Ctrl+Alt+G from anywhere on your computer to instantly show/hide Lightning Games! This works even when the app is minimized. Perfect for quick gaming sessions.",
                target: ".shortcut-badge",
                position: "bottom",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "Ctrl+Alt+G", action: "Toggle App Visibility" }
                ]
            },
            {
                title: "⌨️ Keyboard Navigation",
                description: "Navigate the launcher entirely with your keyboard! Use arrow keys to move between games, Enter to play, Tab to switch tabs, and number keys (1-6) to jump to categories. Press 'H' to see all shortcuts.",
                target: ".games-grid",
                position: "bottom",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "↑↓←→", action: "Navigate Grid" },
                    { key: "Enter", action: "Play Game" },
                    { key: "H", action: "Show Shortcuts" },
                    { key: "1-6", action: "Jump to Category" }
                ]
            },
            {
                title: "💾 Data Management",
                description: "In Settings, you can export your data as a JSON file to backup your progress, or import previously exported data. There's also a Hard Reset option to clear all data if needed.",
                target: ".settings-panel",
                position: "left",
                action: "highlight",
                keyboardShortcuts: [
                    { key: "Settings", action: "Data Management" }
                ]
            },
            {
                title: "🎉 You're Ready!",
                description: "Congratulations! You now know all the features of Lightning Games. Start playing, unlock achievements, customize your experience, and have fun! Press 'Next' to complete the tutorial.",
                target: null,
                position: "center",
                action: "celebration",
                keyboardShortcuts: [
                    { key: "→", action: "Complete Tutorial" },
                    { key: "Esc", action: "Exit Tutorial" }
                ]
            }
        ];
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.createTutorialUI();
        this.showStep(0);
        window.soundManager?.playShow?.();
    }

    createTutorialUI() {
        // Remove existing tutorial if any
        const existing = document.getElementById('tutorial-container');
        if (existing) existing.remove();

        this._boundKeyHandler = (e) => this.handleKeyboard(e);

        // Create main container
        this.tutorialContainer = document.createElement('div');
        this.tutorialContainer.id = 'tutorial-container';
        this.tutorialContainer.className = 'tutorial-container';
        this.tutorialContainer.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-spotlight"></div>
            <div class="tutorial-tooltip">
                <div class="tutorial-tooltip-header">
                    <h3 class="tutorial-tooltip-title"></h3>
                    <button class="tutorial-close" title="Close Tutorial">✕</button>
                </div>
                <p class="tutorial-tooltip-description"></p>
                <div class="tutorial-keyboard-hints"></div>
                <div class="tutorial-progress-bar">
                    <div class="tutorial-progress-fill"></div>
                </div>
                <div class="tutorial-controls">
                    <button class="tutorial-btn-skip">Skip Tutorial</button>
                    <button class="tutorial-btn-prev">← Previous</button>
                    <button class="tutorial-btn-next">Next →</button>
                </div>
            </div>
            <div class="tutorial-confetti-container"></div>
        `;

        document.body.appendChild(this.tutorialContainer);

        // Cache elements
        this.spotlightElement = this.tutorialContainer.querySelector('.tutorial-spotlight');
        this.tooltipElement = this.tutorialContainer.querySelector('.tutorial-tooltip');
        this.progressBar = this.tutorialContainer.querySelector('.tutorial-progress-fill');
        this.keyboardHints = this.tutorialContainer.querySelector('.tutorial-keyboard-hints');

        // Event listeners
        this.tutorialContainer.querySelector('.tutorial-close').addEventListener('click', () => this.end());
        this.tutorialContainer.querySelector('.tutorial-btn-skip').addEventListener('click', () => this.end());
        this.tutorialContainer.querySelector('.tutorial-btn-prev').addEventListener('click', () => this.previousStep());
        this.tutorialContainer.querySelector('.tutorial-btn-next').addEventListener('click', () => this.nextStep());

        // Keyboard navigation
        document.addEventListener('keydown', this._boundKeyHandler);
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;

        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];

        // Update progress bar
        const progress = ((stepIndex + 1) / this.steps.length) * 100;
        this.progressBar.style.width = progress + '%';

        // Update title and description
        this.tooltipElement.querySelector('.tutorial-tooltip-title').textContent = step.title;
        this.tooltipElement.querySelector('.tutorial-tooltip-description').textContent = step.description;

        // Update keyboard hints
        this.updateKeyboardHints(step.keyboardShortcuts);

        // Handle spotlight
        if (step.target) {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                this.showSpotlight(targetElement, step.position);
            } else {
                this.hideSpotlight();
            }
        } else {
            this.hideSpotlight();
        }

        // Position tooltip
        this.positionTooltip(step.position);

        // Handle special actions
        if (step.action === 'celebration') {
            this.createConfetti();
            window.soundManager?.playAchievement?.();
        } else if (step.action === 'intro') {
            this.hideSpotlight();
        }

        // Update button states
        this.updateControlButtons();

        // Save progress
        this.saveProgress();
    }

    showSpotlight(element, position = 'bottom') {
        const rect = element.getBoundingClientRect();
        const padding = 20;

        this.spotlightElement.style.display = 'block';
        this.spotlightElement.style.left = (rect.left - padding) + 'px';
        this.spotlightElement.style.top = (rect.top - padding) + 'px';
        this.spotlightElement.style.width = (rect.width + padding * 2) + 'px';
        this.spotlightElement.style.height = (rect.height + padding * 2) + 'px';
        this.spotlightElement.style.animation = 'tutorial-spotlight-pulse 2s infinite';
    }

    hideSpotlight() {
        this.spotlightElement.style.display = 'none';
    }

    positionTooltip(position = 'bottom') {
        const tooltip = this.tooltipElement;
        const spotlight = this.spotlightElement;

        // Reset classes
        tooltip.className = 'tutorial-tooltip';

        if (position === 'center') {
            tooltip.classList.add('tutorial-tooltip-center');
        } else if (position === 'top') {
            tooltip.classList.add('tutorial-tooltip-top');
        } else if (position === 'bottom') {
            tooltip.classList.add('tutorial-tooltip-bottom');
        } else if (position === 'left') {
            tooltip.classList.add('tutorial-tooltip-left');
        } else if (position === 'right') {
            tooltip.classList.add('tutorial-tooltip-right');
        }

        tooltip.style.animation = 'tutorial-tooltip-slideUp 0.5s ease-out';
    }

    updateKeyboardHints(shortcuts) {
        this.keyboardHints.innerHTML = '';

        shortcuts.forEach(shortcut => {
            const hint = document.createElement('div');
            hint.className = 'tutorial-keyboard-hint';
            hint.innerHTML = `
                <kbd class="tutorial-key">${shortcut.key}</kbd>
                <span class="tutorial-hint-text">${shortcut.action}</span>
            `;
            this.keyboardHints.appendChild(hint);
        });
    }

    updateControlButtons() {
        const prevBtn = this.tutorialContainer.querySelector('.tutorial-btn-prev');
        const nextBtn = this.tutorialContainer.querySelector('.tutorial-btn-next');

        prevBtn.disabled = this.currentStep === 0;
        nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Complete ✓' : 'Next →';
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
            window.soundManager?.playHover?.();
        } else {
            this.end();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
            window.soundManager?.playHover?.();
        }
    }

    handleKeyboard(e) {
        if (!this.isActive) return;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this.nextStep();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.previousStep();
                break;
            case 'Escape':
                e.preventDefault();
                this.end();
                break;
        }
    }

    createConfetti() {
        const container = this.tutorialContainer.querySelector('.tutorial-confetti-container');
        container.innerHTML = '';

        const colors = [
            'var(--accent-cyan)',
            'var(--accent-magenta)',
            'var(--accent-green)',
            'var(--accent-purple)',
            'var(--accent-yellow)',
            'var(--accent-orange)'
        ];

        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'tutorial-confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (4 + Math.random() * 8) + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.animation = `tutorial-confetti-fall ${2 + Math.random() * 1.5}s ease-in forwards`;
            confetti.style.animationDelay = Math.random() * 0.3 + 's';
            container.appendChild(confetti);
        }
    }

    end() {
        if (!this.isActive) return;

        this.isActive = false;
        this.tutorialContainer?.remove();
        if (this._boundKeyHandler) document.removeEventListener('keydown', this._boundKeyHandler);
        this._boundKeyHandler = null;
        
        // Mark tutorial as completed
        localStorage.setItem('lg_tutorial_completed', 'true');
        localStorage.setItem('lg_tutorial_step', '0');
        
        window.soundManager?.playClick?.();
    }

    saveProgress() {
        localStorage.setItem('lg_tutorial_step', this.currentStep.toString());
    }

    loadProgress() {
        const saved = localStorage.getItem('lg_tutorial_step');
        if (saved) {
            this.currentStep = parseInt(saved);
        }
    }

    isCompleted() {
        return localStorage.getItem('lg_tutorial_completed') === 'true';
    }

    restart() {
        localStorage.removeItem('lg_tutorial_completed');
        localStorage.setItem('lg_tutorial_step', '0');
        this.currentStep = 0;
        this.start();
    }
}

// Initialize tutorial system globally
window.tutorialSystem = new TutorialSystem();
