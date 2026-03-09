/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./renderer/**/*.{js,jsx}",
    "./games/**/*.{js,jsx}",
  ],
  safelist: [
    // Buttons
    'btn-neon',
    'btn-neon-secondary',
    'btn-neon-ghost',
    'btn-neon-danger',
    'btn-neon-success',
    'btn-neon-sm',
    'btn-neon-icon',
    'toggle-neon',
    // Cards
    'card-neon',
    'card-stats',
    'card-achievement',
    'card-settings',
    'card-modal',
    // Inputs
    'input-neon',
    'input-search',
    'select-neon',
    'range-neon',
    'checkbox-neon',
    'textarea-neon',
    // Badges
    'badge-category',
    'badge-achievement',
    'badge-difficulty',
    'badge-status',
    'badge-notification',
    'badge-rarity',
    // Text
    'text-neon',
    'text-neon-glow',
    'title-neon',
    'subtitle-neon',
    'caption-neon',
    'score-neon',
    'highscore-neon',
    // Containers
    'container-glass',
    'container-neon',
    'container-gradient',
    'section-neon',
    // Animations
    'animate-neon-glow',
    'animate-neon-pulse',
    'animate-neon-float',
    'animate-neon-spin',
    'animate-neon-bounce',
    'animate-neon-blink',
    'animate-neon-shimmer',
    // Progress
    'progress-neon',
    'progress-circle',
    'progress-achievement',
    // Tabs
    'tab-neon',
    'tab-group-neon',
    // Tooltips
    'tooltip-neon',
    // Loaders
    'spinner-neon',
    'loader-dots',
    'loader-bar',
    'loader-pulse',
    // Dropdowns
    'dropdown-neon',
    'dropdown-neon-item',
    'dropdown-trigger',
    // Modals
    'modal-overlay',
    'modal-content',
    'modal-header',
    'modal-title',
    'modal-close',
    'modal-body',
    'modal-footer',
    // Notifications
    'toast-neon',
    'notification-panel',
    'notification-item',
    // Game Grid
    'game-grid',
    'game-icon',
    'game-name',
    'game-score',
    'game-highscore',
    // Settings
    'settings-section',
    'settings-section-title',
    'settings-item',
    'settings-label',
    'settings-value',
    // Footer
    'footer-stats',
    'footer-stat',
    'footer-stat-value',
    // Utilities
    'scrollbar-hide',
    'truncate-2',
    'truncate-3',
  ],
  theme: {
    extend: {
      colors: {
        // Neon theme colors
        'neon-cyan': '#00d4ff',
        'neon-magenta': '#ff00aa',
        'neon-green': '#00ff88',
        'neon-yellow': '#ffcc00',
        'neon-orange': '#ff8844',
        'neon-purple': '#8855ff',
        'neon-red': '#ff4466',
        'neon-dark': '#050512',
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 30px rgba(0, 220, 255, 0.25), 0 0 60px rgba(0, 220, 255, 0.08)',
        'neon-magenta': '0 0 30px rgba(255, 0, 170, 0.25), 0 0 60px rgba(255, 0, 170, 0.08)',
        'neon-green': '0 0 30px rgba(0, 255, 136, 0.25), 0 0 60px rgba(0, 255, 136, 0.08)',
        'neon-purple': '0 0 30px rgba(136, 85, 255, 0.25), 0 0 60px rgba(136, 85, 255, 0.08)',
      },
      animation: {
        'glow': 'glow 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(0, 220, 255, 0.25)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 220, 255, 0.5)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's reset to keep existing styles
  },
}
