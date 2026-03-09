// Launcher UI v2.0 - Premium game selection, high scores, particles, smooth transitions

(function () {
    const gm = window.gameManager;

    const GAME_CARDS_CONFIG = [
        {
            id: 'snake',
            icon: '🐍',
            name: 'Snake',
            desc: 'Classic snake game',
            category: 'arcade',
            color: '--accent-green',
            glowColor: 'rgba(0, 255, 136, 0.12)',
            borderColor: 'rgba(0, 255, 136, 0.35)',
            shadowColor: '0 0 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(0, 255, 136, 0.06)'
        },
        {
            id: 'cyberdash',
            icon: '⚡',
            name: 'Cyber Dash',
            desc: 'Dodge obstacles, collect energy',
            category: 'arcade',
    color: '--accent-cyan',
            glowColor: 'rgba(0, 212, 255, 0.12)',
            borderColor: 'rgba(0, 212, 255, 0.35)',
            shadowColor: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.06)'
        },
        {
            id: 'tetris',
            icon: '🧱',
            name: 'Tetris',
            desc: 'Block stacking puzzle',
            category: 'arcade',
            color: '--accent-magenta',
            glowColor: 'rgba(255, 0, 170, 0.12)',
            borderColor: 'rgba(255, 68, 102, 0.35)',
            shadowColor: '0 0 30px rgba(255, 68, 102, 0.2), 0 0 60px rgba(255, 68, 102, 0.06)'
        },
        {
            id: 'asteroids',
            icon: '☄️',
            name: 'Asteroids',
            desc: 'Survive in space',
            category: 'arcade',
            color: '#ffdd00',
            glowColor: 'rgba(255, 221, 0, 0.12)',
            borderColor: 'rgba(255, 221, 0, 0.35)',
            shadowColor: '0 0 30px rgba(255, 221, 0, 0.2), 0 0 60px rgba(255, 221, 0, 0.06)'
        },
        {
            id: 'frogger',
            icon: '🐸',
            name: 'Frogger',
            desc: 'Cross the road',
            category: 'arcade',
    color: '--accent-green',
    glowColor: 'rgba(0, 255, 136, 0.12)',
    borderColor: 'rgba(0, 255, 136, 0.35)',
    shadowColor: 'rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.06)'
        },
        {
            id: 'memory',
            icon: '🧠',
            name: 'Memory Match',
            desc: 'Match the cards',
            category: 'puzzle',
    color: '--accent-blue',
    glowColor: 'rgba(102, 102, 255, 0.12)',
    borderColor: 'rgba(102, 102, 255, 0.35)',
    shadowColor: '0 0 30px rgba(102, 102, 255, 0.2), 0 0 60px rgba(102, 102, 255, 0.06)'
        },
        {
            id: 'tictactoe',
            icon: '❌',
            name: 'Tic-Tac-Toe',
            desc: 'Classic X-O-X',
            category: 'puzzle',
    color: '--accent-purple',
    glowColor: 'rgba(136, 85, 255, 0.12)',
    borderColor: 'rgba(136, 85, 255, 0.35)',
    shadowColor: '0 0 30px rgba(136, 85, 255, 0.2), 0 0 60px rgba(136, 85, 255, 0.06)'
        },
        {
            id: 'whackamole',
            icon: '🔨',
            name: 'Whack-A-Mole',
            desc: 'Mole hunting',
            category: 'arcade',
            color: '#ff8800',
            glowColor: 'rgba(255, 136, 0, 0.12)',
            borderColor: 'rgba(255, 136, 0, 0.35)',
            shadowColor: '0 0 30px rgba(255, 136, 0, 0.2), 0 0 60px rgba(255, 136, 0, 0.06)'
        },
        {
            id: 'doodlejump',
            icon: '🎈',
            name: 'Neon Jump',
            desc: 'Fly high',
            category: 'arcade',
            color: '#00ff44',
            glowColor: 'rgba(0, 255, 68, 0.12)',
            borderColor: 'rgba(0, 255, 68, 0.35)',
            shadowColor: '0 0 30px rgba(0, 255, 68, 0.2), 0 0 60px rgba(0, 255, 68, 0.06)'
        },
        {
            id: 'simon',
            icon: '🎛️',
            name: 'Memotron',
            desc: 'Remember the sequence',
            category: 'puzzle',
            color: '#ffffff',
            glowColor: 'rgba(255, 255, 255, 0.12)',
            borderColor: 'rgba(255, 255, 255, 0.35)',
            shadowColor: '0 0 30px rgba(255, 255, 255, 0.2), 0 0 60px rgba(255, 255, 255, 0.06)'
        },
        {
            id: 'runner',
            icon: '🦖',
            name: 'Neon Runner',
            desc: 'Overcome obstacles',
            category: 'arcade',
    color: '--accent-yellow',
    glowColor: 'rgba(255, 204, 0, 0.12)',
    borderColor: 'rgba(255, 204, 0, 0.35)',
    shadowColor: '0 0 30px rgba(255, 204, 0, 0.2), 0 0 60px rgba(255, 204, 0, 0.06)'
        },
        {
            id: 'game2048',
            icon: '✨',
            name: '2048',
            desc: 'Number merging',
            category: 'puzzle',
    color: '--accent-yellow',
    glowColor: 'rgba(255, 204, 0, 0.12)',
    borderColor: 'rgba(255, 204, 0, 0.35)',
    shadowColor: '0 0 30px rgba(255, 204, 0, 0.2), 0 0 60px rgba(255, 204, 0, 0.06)'
        },
        {
            id: 'flappy',
            icon: '🐦',
            name: 'Flappy Bird',
            desc: 'Flight simulation',
            category: 'arcade',
            color: '--accent-yellow',
            glowColor: 'rgba(255, 204, 0, 0.12)',
            borderColor: 'rgba(255, 204, 0, 0.35)',
            shadowColor: '0 0 30px rgba(255, 204, 0, 0.2), 0 0 60px rgba(255, 204, 0, 0.06)'
        },
        {
            id: 'minesweeper',
            icon: '💣',
            name: 'Minesweeper',
            desc: 'Logic puzzle',
            category: 'puzzle',
    color: '--accent-red',
    glowColor: 'rgba(255, 68, 102, 0.12)',
    borderColor: 'rgba(255, 68, 102, 0.35)',
    shadowColor: '0 0 30px rgba(255, 68, 102, 0.2), 0 0 60px rgba(255, 68, 102, 0.06)'
        },
        {
            id: 'pong',
            icon: '🏓',
            name: 'Squash Pong',
            desc: 'Single player pong',
            category: 'classic',
            color: '--accent-green',
            glowColor: 'rgba(0, 255, 136, 0.12)',
            borderColor: 'rgba(0, 255, 136, 0.35)',
            shadowColor: '0 0 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(0, 255, 136, 0.06)'
        },
        {
            id: 'neonduel',
            icon: '⚔️',
            name: 'Neon Duel',
            desc: '2 Player Local Duel',
            category: 'classic',
            color: '#ff00aa',
            glowColor: 'rgba(255, 0, 170, 0.12)',
            borderColor: 'rgba(255, 0, 170, 0.35)',
            shadowColor: '0 0 30px rgba(255, 0, 170, 0.2), 0 0 60px rgba(255, 0, 170, 0.06)'
        },
        {
            id: 'breakout',
            icon: '🧱',
            name: 'Breakout',
            desc: 'Brick breaking',
            category: 'classic',
    color: '--accent-magenta',
    glowColor: 'rgba(255, 0, 170, 0.12)',
    borderColor: 'rgba(255, 68, 102, 0.35)',
    shadowColor: '0 0 30px rgba(255, 68, 102, 0.2), 0 0 60px rgba(255, 68, 102, 0.06)'
        },
        {
            id: 'space',
            icon: '🚀',
            name: 'Space Shooter',
            desc: 'Space battle',
            category: 'arcade',
    color: '--accent-cyan',
    glowColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
    shadowColor: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.06)'
        },
        {
            id: 'orbcollector',
            icon: '🟡',
            name: 'Orb Collector',
            desc: 'Collect orbs, avoid mines',
            category: 'arcade',
            color: '#ffdd55',
            glowColor: 'rgba(255, 221, 85, 0.12)',
            borderColor: 'rgba(255, 221, 85, 0.35)',
            shadowColor: '0 0 30px rgba(255, 221, 85, 0.2), 0 0 60px rgba(255, 221, 85, 0.06)'
        },
        {
            id: 'skyfall',
            icon: '⭐',
            name: 'SkyFall',
            desc: 'Catch stars, dodge meteors',
            category: 'arcade',
            color: '#55aaff',
            glowColor: 'rgba(85, 170, 255, 0.12)',
            borderColor: 'rgba(85, 170, 255, 0.35)',
            shadowColor: '0 0 30px rgba(85, 170, 255, 0.2), 0 0 60px rgba(85, 170, 255, 0.06)'
        },
        {
            id: 'lasergrid',
            icon: '🧊',
            name: 'Laser Grid',
            desc: 'Dodge scanning lasers',
            category: 'arcade',
            color: '#00ffff',
            glowColor: 'rgba(0, 255, 255, 0.12)',
            borderColor: 'rgba(0, 255, 255, 0.35)',
            shadowColor: '0 0 30px rgba(0, 255, 255, 0.2), 0 0 60px rgba(0, 255, 255, 0.06)'
        },
        {
            id: 'orbit',
            icon: '🛰️',
            name: 'Orbit',
            desc: 'Survive in orbit',
            category: 'arcade',
            color: '#8855ff',
            glowColor: 'rgba(136, 85, 255, 0.12)',
            borderColor: 'rgba(136, 85, 255, 0.35)',
            shadowColor: '0 0 30px rgba(136, 85, 255, 0.2), 0 0 60px rgba(136, 85, 255, 0.06)'
        },
        {
            id: 'stacker',
            icon: '🏗️',
            name: 'Stacker',
            desc: 'Build a block tower',
            category: 'arcade',
            color: '#ffaa55',
            glowColor: 'rgba(255, 170, 85, 0.12)',
            borderColor: 'rgba(255, 170, 85, 0.35)',
            shadowColor: '0 0 30px rgba(255, 170, 85, 0.2), 0 0 60px rgba(255, 170, 85, 0.06)'
        },
        {
            id: 'blaster',
            icon: '🔫',
            name: 'Blaster',
            desc: 'Alien invasion defense',
            category: 'arcade',
            color: '#ff3355',
            glowColor: 'rgba(255, 51, 85, 0.12)',
            borderColor: 'rgba(255, 51, 85, 0.35)',
            shadowColor: '0 0 30px rgba(255, 51, 85, 0.2), 0 0 60px rgba(255, 51, 85, 0.06)'
        },
        {
            id: 'pixelquest',
            icon: '🏰',
            name: 'Pixel Quest',
            desc: 'Dungeon adventure',
            category: 'arcade',
            color: '#aa55ff',
            glowColor: 'rgba(170, 85, 255, 0.12)',
            borderColor: 'rgba(170, 85, 255, 0.35)',
            shadowColor: '0 0 30px rgba(170, 85, 255, 0.2), 0 0 60px rgba(170, 85, 255, 0.06)'
        },
        {
            id: 'wordquest',
            icon: '📝',
            name: 'Word Quest',
            desc: 'Spell the words',
            category: 'puzzle',
            color: '#55ffaa',
            glowColor: 'rgba(85, 255, 170, 0.12)',
            borderColor: 'rgba(85, 255, 170, 0.35)',
            shadowColor: '0 0 30px rgba(85, 255, 170, 0.2), 0 0 60px rgba(85, 255, 170, 0.06)'
        },
        {
            id: 'bouncy',
            icon: '⚽',
            name: 'Bouncy Ball',
            desc: 'Physics bounce game',
            category: 'arcade',
            color: '#ffaa00',
            glowColor: 'rgba(255, 170, 0, 0.12)',
            borderColor: 'rgba(255, 170, 0, 0.35)',
            shadowColor: '0 0 30px rgba(255, 170, 0, 0.2), 0 0 60px rgba(255, 170, 0, 0.06)'
        },
        {
            id: 'rhythmtap',
            icon: '🎵',
            name: 'Rhythm Tap',
            desc: 'Tap to the beat',
            category: 'arcade',
            color: '#ff55ff',
            glowColor: 'rgba(255, 85, 255, 0.12)',
            borderColor: 'rgba(255, 85, 255, 0.35)',
            shadowColor: '0 0 30px rgba(255, 85, 255, 0.2), 0 0 60px rgba(255, 85, 255, 0.06)'
        },
        {
            id: 'jewels',
            icon: '💎',
            name: 'Jewel Match',
            desc: 'Match 3 gems',
            category: 'puzzle',
            color: '#55aaff',
            glowColor: 'rgba(85, 170, 255, 0.12)',
            borderColor: 'rgba(85, 170, 255, 0.35)',
            shadowColor: '0 0 30px rgba(85, 170, 255, 0.2), 0 0 60px rgba(85, 170, 255, 0.06)'
        },
        {
            id: 'ninja',
            icon: '🥷',
            name: 'Ninja Slice',
            desc: 'Slice the targets',
            category: 'arcade',
            color: '#222222',
            glowColor: 'rgba(255, 255, 255, 0.12)',
            borderColor: 'rgba(255, 255, 255, 0.35)',
            shadowColor: '0 0 30px rgba(255, 255, 255, 0.2), 0 0 60px rgba(255, 255, 255, 0.06)'
        },
        {
            id: 'piano',
            icon: '🎹',
            name: 'Neon Piano',
            desc: 'Play the piano',
            category: 'puzzle',
            color: '#00d4ff',
            glowColor: 'rgba(0, 212, 255, 0.12)',
            borderColor: 'rgba(0, 212, 255, 0.35)',
            shadowColor: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.06)'
        },
        {
            id: 'neondraw',
            icon: '✏️',
            name: 'Neon Draw',
            desc: 'Relax and draw',
            category: 'puzzle',
            color: '#ff00aa',
            glowColor: 'rgba(255, 0, 170, 0.12)',
            borderColor: 'rgba(255, 0, 170, 0.35)',
            shadowColor: '0 0 30px rgba(255, 0, 170, 0.2), 0 0 60px rgba(255, 0, 170, 0.06)'
        },
        {
            id: 'orbitdefense',
            icon: '🛡️',
            name: 'Orbit Defense',
            desc: 'Protect the center',
            category: 'arcade',
            color: '#00d4ff',
            glowColor: 'rgba(0, 212, 255, 0.12)',
            borderColor: 'rgba(0, 212, 255, 0.35)',
            shadowColor: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.06)'
        },
        {
            id: 'gravityflip',
            icon: '⬆️',
            name: 'Gravity Flip',
            desc: 'Flip gravity to survive',
            category: 'arcade',
            color: '#8855ff',
            glowColor: 'rgba(136, 85, 255, 0.12)',
            borderColor: 'rgba(136, 85, 255, 0.35)',
            shadowColor: '0 0 30px rgba(136, 85, 255, 0.2), 0 0 60px rgba(136, 85, 255, 0.06)'
        },
        {
            id: 'tapdash',
            icon: '🎵',
            name: 'Tap Dash',
            desc: 'Rhythm tapping',
            category: 'arcade',
            color: '#ffcc00',
            glowColor: 'rgba(255, 204, 0, 0.12)',
            borderColor: 'rgba(255, 204, 0, 0.35)',
            shadowColor: '0 0 30px rgba(255, 204, 0, 0.2), 0 0 60px rgba(255, 204, 0, 0.06)'
        },
        {
            id: 'towerdefense',
            icon: '🗼',
            name: 'Tower Defense',
            desc: 'Build towers, defend your base',
            category: 'arcade',
            color: '#00d4ff',
            glowColor: 'rgba(0, 212, 255, 0.12)',
            borderColor: 'rgba(0, 212, 255, 0.35)',
            shadowColor: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.06)'
        },

    ];

    const ALL_ACHIEVEMENTS = [
        { id: 'first_game', title: 'Welcome!', desc: 'You launched your first game.', icon: '🎮' },
        { id: 'record_breaker', title: 'Record Breaker!', desc: 'You broke a record.', icon: '🏆' },
        { id: 'score_1000', title: 'Master Player', desc: 'You reached 1000 points.', icon: '🔥' },
        { id: 'snake_100', title: 'Snake Tamer', desc: 'Scored 100 points in Snake.', icon: '🐍' },
        { id: 'tetris_500', title: 'Architect', desc: 'Scored 500 points in Tetris.', icon: '🧱' },
        { id: 'simon_10', title: 'Memory Apprentice', desc: 'Scored 10 points in Memotron.', icon: '🧠' },
        { id: 'minesweeper_win', title: 'Mine Expert', desc: 'Cleared a challenging minefield.', icon: '💣' },
        { id: 'runner_high', title: 'Fast Runner', desc: 'Scored 500 in Neon Runner.', icon: '🦖' },
        { id: 'frogger_master', title: 'Frogger Master', desc: 'Crossed the road in Frogger!', icon: '👑' },
        { id: 'warmup', title: 'Warmup Done', desc: 'Played a total of 10 games.', icon: '🔥' },
        // ULTRA ACHIEVEMENTS
        { id: 'marathon_runner', title: 'Marathon Runner', desc: 'Played a total of 50 games.', icon: '🏃', ultra: true },
        { id: 'night_owl', title: 'Night Owl', desc: 'Played a game after 10 PM.', icon: '🦉', ultra: true },
        { id: 'early_bird', title: 'Early Bird', desc: 'Played a game before 8 AM.', icon: '🐤', ultra: true },
        { id: 'weekend_warrior', title: 'Weekend Warrior', desc: 'Played a game on Saturday or Sunday.', icon: '⚔️', ultra: true },
        { id: 'snake_charmer', title: 'Snake Charmer', desc: 'Scored 250 points in Snake.', icon: '🐍', ultra: true },
        { id: 'pentominium', title: 'Pentominium', desc: 'Scored 1000 points in Tetris.', icon: '🧱', ultra: true },
        { id: 'safe_stepper', title: 'Safe Stepper', desc: 'Marked 20 mines correctly in one go.', icon: '🛡️', ultra: true },
        { id: 'first_rock', title: 'First Rock', desc: 'Destroyed an asteroid for the first time.', icon: '🪨', hidden: true },
        { id: 'asteroid_annihilator', title: 'Asteroid Annihilator', desc: 'Destroyed a total of 50 asteroids.', icon: '☄️', ultra: true },
        { id: 'space_ace', title: 'Space Ace', desc: 'Destroyed a total of 100 asteroids.', icon: '🌌', ultra: true },
        { id: 'memory_god', title: 'Memory God', desc: 'Finished Memory Match under 30 seconds.', icon: '⚡', ultra: true },
        { id: 'reflex_master', title: 'Reflex Master', desc: 'Achieved a 10x combo in Snake.', icon: '💨', ultra: true },
        { id: 'persistent', title: 'Persistent', desc: 'Played the same game 5 times in a row.', icon: '🔄', ultra: true },
        { id: 'explorer', title: 'Explorer', desc: 'Played 10 different games.', icon: '🗺️', ultra: true },
        { id: 'master_2048', title: '2048 Master', desc: 'Reached the 4096 tile.', icon: '🌟', ultra: true },
        { id: 'high_jumper', title: 'High Jumper', desc: 'Reached 10000 height in Neon Jump.', icon: '🚀', ultra: true },
        { id: 'simons_rival', title: 'Simon\'s Rival', desc: 'Scored 20 points in Memotron.', icon: '🧠', ultra: true },
        { id: 'mole_slayer', title: 'Mole Slayer', desc: 'Scored 200 points in Whack-A-Mole.', icon: '🔨', ultra: true },
        { id: 'indestructible', title: 'Indestructible', desc: 'Survived 3 minutes in Asteroids.', icon: '💎', ultra: true },
        { id: 'precision', title: 'Precision', desc: 'Scored 50 points in Breakout without losing a ball.', icon: '🎯', ultra: true },
        { id: 'triple_threat', title: 'Triple Threat', desc: 'Won Tic-Tac-Toe under 10 seconds.', icon: '🔥', ultra: true },
        { id: 'addict', title: 'Addict', desc: 'Total playtime exceeded 1 hour.', icon: '💊', ultra: true },
        { id: 'no_life', title: 'Non-Stop', desc: 'Played a total of 100 games.', icon: '⚡', ultra: true },
        { id: 'collector', title: 'Collector', desc: 'Unlocked 15 achievements.', icon: '👑', ultra: true },
        { id: 'godly', title: 'Godly', desc: 'Unlocked all achievements.', icon: '⛩️', ultra: true },
        { id: 'speedrunner', title: 'Speedrunner', desc: 'Scored 500 in Neon Runner within 1 minute.', icon: '🏎️', ultra: true },
        { id: 'bulletproof', title: 'Bulletproof', desc: 'Survived 1 minute in Space Shooter without getting hit.', icon: '🧥', ultra: true },
        { id: 'socialite', title: 'Socialite', desc: 'Switched tabs 10 times.', icon: '📱', ultra: true },

    ];

    // Elements
    const launcherView = document.getElementById('launcher-view');
    const gameView = document.getElementById('game-view');
    const gamesGrid = document.getElementById('games-grid');
    const statsView = document.getElementById('stats-view');
    const achievementsList = document.getElementById('achievements-list');
    const statTotalPlayed = document.getElementById('stat-total-played');
    const statAchievementsCount = document.getElementById('stat-achievements');
    const btnClose = document.getElementById('btn-close');
    const btnBack = document.getElementById('btn-back');
    const btnReset = document.getElementById('btn-reset');
    const btnSettings = document.getElementById('btn-settings');
    const gameTitle = document.getElementById('game-title');
    const totalPlaytime = document.getElementById('total-playtime');
    const bestScoreDisplay = document.getElementById('best-score-display');
    const favoriteCountDisplay = document.getElementById('favorite-count');
    const appContainer = document.querySelector('.app-container');

    // Ultra Upgrade Elements
    const gameSearch = document.getElementById('game-search');
    const searchClear = document.getElementById('search-clear');
    const recentlyPlayedSection = document.getElementById('recently-played-section');
    const recentlyPlayedList = document.getElementById('recently-played-list');
    const volumeSlider = document.getElementById('volume-slider');

    if (launcherView) {
        let targetScrollTop = launcherView.scrollTop;
        let scrollAnimId = null;

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

        const tickScroll = () => {
            const current = launcherView.scrollTop;
            const delta = targetScrollTop - current;

            if (Math.abs(delta) < 0.5) {
                launcherView.scrollTop = targetScrollTop;
                scrollAnimId = null;
                return;
            }

            launcherView.scrollTop = current + delta * 0.2;
            scrollAnimId = requestAnimationFrame(tickScroll);
        };

        launcherView.addEventListener('scroll', () => {
            if (!scrollAnimId) {
                targetScrollTop = launcherView.scrollTop;
            }
        }, { passive: true });

        launcherView.addEventListener('wheel', (e) => {
            const settingsNow = gm.getSettings ? gm.getSettings() : { reducedMotion: false };
            if (settingsNow.reducedMotion) return;
            if (launcherView.classList.contains('hidden')) return;

            e.preventDefault();

            const maxScroll = launcherView.scrollHeight - launcherView.clientHeight;
            targetScrollTop = clamp(targetScrollTop + e.deltaY, 0, Math.max(0, maxScroll));

            if (!scrollAnimId) {
                scrollAnimId = requestAnimationFrame(tickScroll);
            }
        }, { passive: false });
    }
    const achievementContainer = document.getElementById('achievement-container');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close');
    const settingsReducedMotion = document.getElementById('settings-reduced-motion');
    const settingsShakeIntensity = document.getElementById('settings-shake-intensity');
    const settingsShakeValue = document.getElementById('settings-shake-value');
    const settingsRenderScale = document.getElementById('settings-render-scale');
    const settingsScaleValue = document.getElementById('settings-scale-value');
    const settingsBackdrop = document.querySelector('.settings-backdrop');
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Load initial theme
    const currentTheme = localStorage.getItem('lg_theme') || 'default';
    if (currentTheme !== 'default') {
        document.body.className = `theme-${currentTheme}`;
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        });
    }

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.body.className = theme === 'default' ? '' : `theme-${theme}`;
            localStorage.setItem('lg_theme', theme);
            if (window.soundManager) window.soundManager.playSelect();
            if (window.bgPulse) window.bgPulse(null, null, [255, 255, 255]);
        });
    });

    // Sound Effects Bridge
    const sfx = {
        play(type) {
            if (!window.soundManager) return;
            switch (type) {
                case 'show': window.soundManager.playShow(); break;
                case 'hide': window.soundManager.playHide(); break;
                case 'select': window.soundManager.playSelect(); break;
                case 'hover': window.soundManager.playHover(); break;
                case 'award': window.soundManager.playAchievement(); break;
            }
        },
        award() {
            if (window.soundManager) window.soundManager.playAchievement();
        }
    };

    let currentCategory = 'all';

    function renderGameCards(filter = '') {
        const gamesState = gm.getGameList();
        gamesGrid.innerHTML = '';

        const mergedGames = GAME_CARDS_CONFIG.map(config => {
            const state = gamesState.find(g => g.id === config.id) || {};
            return { ...config, ...state };
        });

        const filtered = mergedGames.filter(g => {
            const matchesSearch = g.name.toLowerCase().includes(filter.toLowerCase()) ||
                (g.desc && g.desc.toLowerCase().includes(filter.toLowerCase()));

            if (currentCategory === 'favorites') {
                return matchesSearch && g.isFavorite;
            }
            if (currentCategory !== 'all') {
                return matchesSearch && g.category === currentCategory;
            }
            return matchesSearch;
        });

        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <span class="no-results-icon">🔍</span>
                <span class="no-results-text">No games found matching "${filter}".</span>
            `;
            gamesGrid.appendChild(noResults);
        }

        const settings = gm.getSettings ? gm.getSettings() : { reducedMotion: false };

        filtered.forEach((config) => {
            const highScore = gm.getHighScore(config.id);
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.gameId = config.id;
            card.style.setProperty('--card-glow', config.glowColor);
            card.style.setProperty('--card-border', config.borderColor);
            card.style.setProperty('--card-shadow', config.shadowColor);

            let scoreHTML = '<span class="game-card-score">Click to play</span>';
            if (config.score > 0) {
                scoreHTML = `<span class="game-card-score">Score: ${config.score}</span>`;
            }

            let highScoreHTML = '';
            if (highScore > 0) {
                highScoreHTML = `<span class="game-card-highscore">🏆 ${highScore}</span>`;
            }

            const cardContent = document.createElement('div');
            cardContent.className = 'game-card-content';

            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = `btn-favorite ${config.isFavorite ? 'active' : ''}`;
            favoriteBtn.innerHTML = '★';
            favoriteBtn.title = config.isFavorite ? 'Remove from favorites' : 'Add to favorites';
            // Removed individual favoriteBtn.addEventListener

            cardContent.innerHTML = `
                <span class="game-card-category">${config.category}</span>
                <div class="game-card-status ${config.hasState ? 'active' : ''}"></div>
                <span class="game-card-icon">${config.icon}</span>
                <span class="game-card-name">${config.name}</span>
                ${scoreHTML}
                ${highScoreHTML}
            `;
            cardContent.appendChild(favoriteBtn);

            card.appendChild(cardContent);

            // Removed individual card.addEventListener('mouseenter', ...)
            // Removed individual card.addEventListener('click', ...)
            // Removed individual card.addEventListener('mousemove', ...)
            // Removed individual card.addEventListener('mouseleave', ...)

            gamesGrid.appendChild(card);
        });

        updateFooterStats();
        renderRecentlyPlayed();
    }

    function renderStats() {
        const unlocked = gm.achievements || [];
        statTotalPlayed.textContent = gm.totalGamesPlayed;
        statAchievementsCount.textContent = `${unlocked.length}/${ALL_ACHIEVEMENTS.length}`;
        
        // Update new stat cards
        const statFavorites = document.getElementById('stat-favorites');
        const statPlaytime = document.getElementById('stat-playtime');
        if (statFavorites) {
            statFavorites.textContent = (gm.favorites || []).length;
        }
        if (statPlaytime) {
            const totalMinutes = Math.floor((gm.totalPlayTime || 0) / 60);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            statPlaytime.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }

        achievementsList.innerHTML = '';
        ALL_ACHIEVEMENTS.forEach(a => {
            const isUnlocked = unlocked.includes(a.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''} ${a.ultra ? 'ultra' : ''}`;
            const isHiddenLocked = a.hidden && !isUnlocked;
            const title = isHiddenLocked ? 'Hidden Achievement' : a.title;
            const icon = isHiddenLocked ? '❔' : a.icon;
            item.innerHTML = `
                <span class="achievement-item-icon">${icon}</span>
                <div class="achievement-item-text">
                    <span class="achievement-item-title">${title}</span>
                    ${a.ultra ? '<span class="achievement-badge">ULTRA</span>' : ''}
                </div>
            `;
            achievementsList.appendChild(item);
        });
    }

    function renderRecentlyPlayed() {
        const gamesState = gm.getGameList();
        const mergedGames = GAME_CARDS_CONFIG.map(config => {
            const state = gamesState.find(g => g.id === config.id) || {};
            return { ...config, ...state };
        });

        const games = mergedGames
            .filter(g => g.lastPlayed > 0)
            .sort((a, b) => b.lastPlayed - a.lastPlayed)
            .slice(0, 5);

        // Hide recently played when searching
        const isSearching = gameSearch.value.trim().length > 0;

        if (games.length > 0 && !isSearching) {
            recentlyPlayedSection.classList.remove('hidden');
            recentlyPlayedList.innerHTML = '';
            games.forEach(g => {
                const item = document.createElement('div');
                item.className = 'recent-item';
                const timeAgo = Math.floor((Date.now() - g.lastPlayed) / 60000);
                const timeText = timeAgo < 1 ? 'Just now' : `${timeAgo} min ago`;

                item.innerHTML = `
                    <span class="recent-icon">${g.icon}</span>
                    <div class="recent-info">
                        <span class="recent-name">${g.name}</span>
                        <span class="recent-time">${timeText}</span>
                    </div>
                `;
                item.addEventListener('click', () => openGame(g.id, g.name, g.icon));
                recentlyPlayedList.appendChild(item);
            });
        } else {
            recentlyPlayedSection.classList.add('hidden');
        }
    }

    function updateFooterStats() {
        if (totalPlaytime) {
            const total = gm.getTotalGamesPlayed();
            totalPlaytime.textContent = `🕐 Toplam: ${total} oyun`;
        }

        if (favoriteCountDisplay) {
            const validIds = new Set(GAME_CARDS_CONFIG.map(g => g.id));
            const favCount = gm.favorites ? gm.favorites.filter(id => validIds.has(id)).length : 0;
            favoriteCountDisplay.textContent = `★ ${favCount}`;
        }

        if (bestScoreDisplay) {
            // Find best high score across all games
            let bestGame = null;
            let bestScore = -1; // Start with -1 to properly identify any recorded score
            GAME_CARDS_CONFIG.forEach(config => {
                const hs = gm.getHighScore(config.id);
                if (hs > bestScore) {
                    bestScore = hs;
                    bestGame = config.name;
                }
            });
            bestScoreDisplay.textContent = (bestGame && bestScore > 0)
                ? `🏆 ${bestGame}: ${bestScore}`
                : '🏆 Best: --';
        }
    }

    let isOpening = false;
    function openGame(id, name, icon) {
        if (isOpening) return;
        isOpening = true;

        sfx.play('select');
        launcherView.classList.add('hidden');
        gameView.classList.remove('hidden');
        gameView.classList.add('slide-in');
        gameTitle.textContent = `${icon} ${name}`;

        // Show ESC hint
        const escHint = document.getElementById('esc-hint');
        if (escHint) escHint.classList.remove('hidden');

        // Remove any old game over overlay
        const overlay = document.querySelector('.game-over-overlay');
        if (overlay) overlay.remove();

        // Validate game ID before starting
        if (!gm || !gm.games[id]) {
            console.error(`Game ID ${id} not found`);
            showLauncher();
            return;
        }

        gm.startGame(id);

        // Throttle back to false after animation
        setTimeout(() => { isOpening = false; }, 500);
    }

    function showLauncher() {
        gm.goBackToLauncher();
        gameView.classList.add('hidden');
        gameView.classList.remove('slide-in');
        launcherView.classList.remove('hidden');
        launcherView.classList.add('fade-in');
        gameSearch.value = ''; // Clear search on return
        renderGameCards();
        sfx.play('hide');

        // Hide ESC hint
        const escHint = document.getElementById('esc-hint');
        if (escHint) escHint.classList.add('hidden');

        // Remove any leftover overlays
        const overlay = document.querySelector('.game-over-overlay');
        if (overlay) overlay.remove();
    }

    // Button handlers
    btnClose.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    btnBack.addEventListener('click', () => {
        showLauncher();
    });

    btnReset.addEventListener('click', () => {
        gm.resetCurrentGame();
    });

    // Random Game Button
    const btnRandom = document.getElementById('btn-random');
    if (btnRandom) {
        btnRandom.addEventListener('click', () => {
            const games = gm.getGameList();
            if (games.length > 0) {
                const randomGame = games[Math.floor(Math.random() * games.length)];
                openGame(randomGame.id, randomGame.name, randomGame.icon);
            }
        });
    }

    // Category Tabs Logic
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderGameCards(gameSearch.value);
            sfx.play('select');
        });
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!gameView.classList.contains('hidden')) {
                showLauncher();
            } else {
                window.electronAPI.closeWindow();
            }
        }

        // Keyboard navigation for game search
        if (e.key === 'Enter') {
            // If game over overlay exists, restart game
            const gameOverOverlay = document.querySelector('.game-over-overlay');
            if (gameOverOverlay && !gameView.classList.contains('hidden')) {
                const restartBtn = gameOverOverlay.querySelector('[id$="-restart"]');
                if (restartBtn) {
                    restartBtn.click();
                    return;
                }
            }

            // If search is focused, open first game
            if (document.activeElement === gameSearch) {
                const firstCard = gamesGrid.querySelector('.game-card');
                if (firstCard) {
                    firstCard.click();
                }
            }
        }
    });

    // Window hide/show events from Electron
    window.electronAPI.onWindowHiding(() => {
        appContainer.classList.remove('window-entering');
        appContainer.classList.add('window-leaving');
        sfx.play('hide');
        setTimeout(() => {
            appContainer.classList.remove('window-leaving');
        }, 500);

        gm.pauseCurrentGame();
    });

    window.electronAPI.onWindowShowing(() => {
        appContainer.classList.remove('window-leaving');
        appContainer.classList.add('window-entering');
        sfx.play('show');
        setTimeout(() => {
            appContainer.classList.toggle('window-entering', false); // Ensure it's off eventually but keeps opacity: 1
            appContainer.style.opacity = '1';
            appContainer.style.transform = 'scale(1) translateY(0)';
            appContainer.style.filter = 'blur(0)';
        }, 500);

        if (gm.getActiveGameId()) {
            gm.resumeCurrentGame();
        } else {
            renderGameCards();
        }
    });

    // --- Ultra Upgrade Event Listeners ---

    // Game Search with Debounce
    let searchTimeout;
    gameSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        // Show/hide clear button
        if (searchClear) {
            searchClear.classList.toggle('hidden', !e.target.value);
        }
        searchTimeout = setTimeout(() => {
            renderGameCards(e.target.value);
        }, 150);
    });

    // Search clear button
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            gameSearch.value = '';
            searchClear.classList.add('hidden');
            renderGameCards('');
            gameSearch.focus();
        });
    }

    // Volume Slider with Feedback
    let lastVol = gm.volume;
    volumeSlider.value = gm.volume;
    volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        gm.setVolume(vol);
        if (Math.abs(vol - lastVol) > 0.1) {
            sfx.play('hover');
            lastVol = vol;
        }
    });

    // --- Settings Modal Logic ---
    function applySettingsToUI(settings) {
        if (!settings) return;
        if (settingsReducedMotion) {
            settingsReducedMotion.checked = !!settings.reducedMotion;
        }
        if (settingsShakeIntensity) {
            const val = typeof settings.shakeIntensity === 'number' ? settings.shakeIntensity : 0.6;
            settingsShakeIntensity.value = val;
            if (settingsShakeValue) {
                settingsShakeValue.textContent = `${Math.round(val * 100)}%`;
            }
        }
        if (settingsRenderScale) {
            const val = typeof settings.renderScale === 'number' ? settings.renderScale : 0.85;
            settingsRenderScale.value = val;
            if (settingsScaleValue) {
                settingsScaleValue.textContent = `${Math.round(val * 100)}%`;
            }
        }
        if (appContainer) {
            if (settings.reducedMotion) {
                appContainer.classList.add('reduced-motion');
            } else {
                appContainer.classList.remove('reduced-motion');
            }
        }
    }

    const initialSettings = gm.getSettings ? gm.getSettings() : { reducedMotion: false, shakeIntensity: 1 };
    applySettingsToUI(initialSettings);

    if (btnSettings && settingsModal) {
        btnSettings.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }

    if (settingsClose && settingsModal) {
        settingsClose.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    if (settingsBackdrop && settingsModal) {
        settingsBackdrop.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    if (settingsReducedMotion) {
        settingsReducedMotion.addEventListener('change', () => {
            gm.updateSettings && gm.updateSettings({
                reducedMotion: settingsReducedMotion.checked
            });
        });
    }

    if (settingsShakeIntensity) {
        settingsShakeIntensity.addEventListener('input', () => {
            const val = parseFloat(settingsShakeIntensity.value || '0.6');
            if (settingsShakeValue) {
                settingsShakeValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({
                shakeIntensity: val
            });
        });
    }

    if (settingsRenderScale) {
        settingsRenderScale.addEventListener('input', () => {
            const val = parseFloat(settingsRenderScale.value || '0.85');
            if (settingsScaleValue) {
                settingsScaleValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({
                renderScale: val
            });
        });
    }

    window.addEventListener('settingsChanged', (e) => {
        applySettingsToUI(e.detail.settings);
    });

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            if (tab === 'games') {
                gamesGrid.classList.remove('hidden');
                recentlyPlayedSection.classList.remove('hidden');
                statsView.classList.add('hidden');
            } else {
                gamesGrid.classList.add('hidden');
                recentlyPlayedSection.classList.add('hidden');
                statsView.classList.remove('hidden');
                renderStats();
            }
            gm.trackTabSwitch();
        });
    });

    // Achievement Listener
    window.addEventListener('achievementUnlocked', (e) => {
        const { title, desc, icon } = e.detail;
        sfx.award();

        const toast = document.createElement('div');
        toast.className = `achievement-toast ${e.detail.ultra ? 'ultra' : ''}`;
        toast.innerHTML = `
            <span class="achievement-icon">${icon}</span>
            <div class="achievement-info">
                <span class="achievement-title">${title}</span>
                <span class="achievement-desc">${desc}</span>
            </div>
        `;
        achievementContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    });

    // Initial render
    gm.totalAchievementsCount = ALL_ACHIEVEMENTS.length;
    renderGameCards();

    // Event Delegation for Games Grid
    gamesGrid.addEventListener('click', (e) => {
        const gameCard = e.target.closest('.game-card');
        if (!gameCard) return;

        const gameId = gameCard.dataset.gameId;
        const config = GAME_CARDS_CONFIG.find(g => g.id === gameId);
        if (!config) return;

        if (e.target.classList.contains('btn-favorite')) {
            e.stopPropagation(); // Prevent card click event from firing
            const isFav = gm.toggleFavorite(gameId);
            // The renderGameCards will re-render all cards, so we don't need to manually update the button state here
            sfx.play('select');
            renderGameCards(gameSearch.value);
        } else {
            openGame(gameId, config.name, config.icon);
        }
    });

    gamesGrid.addEventListener('mouseover', (e) => {
        const gameCard = e.target.closest('.game-card');
        if (gameCard) {
            sfx.play('hover');
        }
    });

    let ticking = false;
    let lastCardContent = null;
    let lastCardRect = null;
    const settings = gm.getSettings ? gm.getSettings() : { reducedMotion: false };

    gamesGrid.addEventListener('mousemove', (e) => {
        if (settings.reducedMotion) return;

        const gameCard = e.target.closest('.game-card');
        const gameCardContent = gameCard ? gameCard.querySelector('.game-card-content') : null;

        if (gameCardContent && gameCardContent !== lastCardContent) {
            // New card hovered, reset previous if any
            if (lastCardContent) {
                lastCardContent.style.transform = 'translateZ(0)';
            }
            lastCardContent = gameCardContent;
            lastCardRect = gameCard.getBoundingClientRect();
        } else if (!gameCardContent && lastCardContent) {
            // Mouse left all cards
            lastCardContent.style.transform = 'translateZ(0)';
            lastCardContent = null;
            lastCardRect = null;
        }

        if (gameCardContent && !ticking) {
            window.requestAnimationFrame(() => {
                const rect = lastCardRect;
                if (!rect) {
                    ticking = false;
                    return;
                }
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;
                gameCardContent.style.transform = `rotateX(${-dy / 8}deg) rotateY(${dx / 8}deg) translateZ(10px)`;
                ticking = false;
            });
            ticking = true;
        }
    });

    gamesGrid.addEventListener('mouseout', (e) => {
        if (settings.reducedMotion) return;

        const gameCard = e.target.closest('.game-card');
        const gameCardContent = gameCard ? gameCard.querySelector('.game-card-content') : null;

        // Only reset if the mouse is truly leaving the current card, not just moving to a child element
        if (lastCardContent && (!gameCardContent || gameCardContent !== lastCardContent)) {
            window.requestAnimationFrame(() => {
                if (lastCardContent) {
                    lastCardContent.style.transform = 'translateZ(0)';
                }
                lastCardContent = null;
            });
        }
    });

})();
