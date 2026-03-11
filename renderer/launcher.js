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
        // ===== NORMAL ACHIEVEMENTS (Başlangıç) =====
        { id: 'first_game', title: 'Welcome!', desc: 'You launched your first game.', icon: '🎮' },
        { id: 'record_breaker', title: 'Record Breaker!', desc: 'You broke a record.', icon: '🏆' },
        { id: 'score_1000', title: 'Master Player', desc: 'You reached 1000 points.', icon: '🔥' },
        { id: 'score_5000', title: 'Elite Player', desc: 'You reached 5000 points in any game.', icon: '💫' },
        { id: 'score_10000', title: 'Legendary Player', desc: 'You reached 10000 points in any game.', icon: '👑' },
        { id: 'first_favorite', title: 'First Love', desc: 'You marked your first favorite game.', icon: '❤️' },
        { id: 'theme_switcher', title: 'Style Master', desc: 'You changed the theme for the first time.', icon: '🎨' },
        { id: 'settings_explorer', title: 'Tinkerer', desc: 'You opened the settings menu.', icon: '⚙️' },
        { id: 'quick_player', title: 'Speed Demon', desc: 'Played 3 games in under 5 minutes.', icon: '⚡' },
        { id: 'comeback_king', title: 'Comeback King', desc: 'Beat your high score after 10 failed attempts.', icon: '🔄' },
        
        // ===== GAME-SPECIFIC ACHIEVEMENTS =====
        { id: 'snake_100', title: 'Snake Tamer', desc: 'Scored 100 points in Snake.', icon: '🐍' },
        { id: 'snake_charmer', title: 'Snake Charmer', desc: 'Scored 250 points in Snake.', icon: '🐍', ultra: true },
        { id: 'snake_master', title: 'Snake Master', desc: 'Scored 500 points in Snake.', icon: '🐍', ultra: true },
        { id: 'snake_god', title: 'Snake God', desc: 'Scored 1000 points in Snake.', icon: '🐍', legendary: true },
        
        { id: 'tetris_500', title: 'Architect', desc: 'Scored 500 points in Tetris.', icon: '🧱' },
        { id: 'pentominium', title: 'Pentominium', desc: 'Scored 1000 points in Tetris.', icon: '🧱', ultra: true },
        { id: 'tetris_master', title: 'Tetris Master', desc: 'Scored 2500 points in Tetris.', icon: '🧱', ultra: true },
        { id: 'tetris_god', title: 'Block God', desc: 'Scored 5000 points in Tetris.', icon: '🧱', legendary: true },
        { id: 'tetris_combo', title: 'Combo Master', desc: 'Clear 4 lines at once (Tetris).', icon: '💥', ultra: true },
        
        { id: 'simon_10', title: 'Memory Apprentice', desc: 'Scored 10 points in Memotron.', icon: '🧠' },
        { id: 'simons_rival', title: 'Simon\'s Rival', desc: 'Scored 20 points in Memotron.', icon: '🧠', ultra: true },
        { id: 'memory_god', title: 'Memory God', desc: 'Finished Memory Match under 30 seconds.', icon: '⚡', ultra: true },
        { id: 'memory_master', title: 'Memory Master', desc: 'Scored 30 points in Memotron.', icon: '🧠', legendary: true },
        
        { id: 'minesweeper_win', title: 'Mine Expert', desc: 'Cleared a challenging minefield.', icon: '💣' },
        { id: 'safe_stepper', title: 'Safe Stepper', desc: 'Marked 20 mines correctly in one go.', icon: '🛡️', ultra: true },
        { id: 'mine_master', title: 'Mine Master', desc: 'Win 10 Minesweeper games.', icon: '💣', ultra: true },
        { id: 'perfect_sweep', title: 'Perfect Sweep', desc: 'Clear Minesweeper without any wrong flags.', icon: '✨', legendary: true },
        
        { id: 'runner_high', title: 'Fast Runner', desc: 'Scored 500 in Neon Runner.', icon: '🦖' },
        { id: 'speedrunner', title: 'Speedrunner', desc: 'Scored 500 in Neon Runner within 1 minute.', icon: '🏎️', ultra: true },
        { id: 'marathon_runner_game', title: 'Marathon Runner', desc: 'Scored 2000 in Neon Runner.', icon: '🦖', ultra: true },
        { id: 'ultra_runner', title: 'Ultra Runner', desc: 'Scored 5000 in Neon Runner.', icon: '🦖', legendary: true },
        
        { id: 'frogger_master', title: 'Frogger Master', desc: 'Crossed the road in Frogger!', icon: '👑' },
        { id: 'frogger_pro', title: 'Frogger Pro', desc: 'Score 1000 in Frogger.', icon: '🐸', ultra: true },
        { id: 'road_warrior', title: 'Road Warrior', desc: 'Cross 50 roads in Frogger.', icon: '🛣️', ultra: true },
        
        { id: 'first_rock', title: 'First Rock', desc: 'Destroyed an asteroid for the first time.', icon: '🪨' },
        { id: 'asteroid_annihilator', title: 'Asteroid Annihilator', desc: 'Destroyed a total of 50 asteroids.', icon: '☄️', ultra: true },
        { id: 'space_ace', title: 'Space Ace', desc: 'Destroyed a total of 100 asteroids.', icon: '🌌', ultra: true },
        { id: 'indestructible', title: 'Indestructible', desc: 'Survived 3 minutes in Asteroids.', icon: '💎', ultra: true },
        { id: 'asteroid_master', title: 'Asteroid Master', desc: 'Destroyed 500 asteroids total.', icon: '☄️', legendary: true },
        
        { id: 'reflex_master', title: 'Reflex Master', desc: 'Achieved a 10x combo in Snake.', icon: '💨', ultra: true },
        { id: 'master_2048', title: '2048 Master', desc: 'Reached the 4096 tile.', icon: '🌟', ultra: true },
        { id: '2048_god', title: '2048 God', desc: 'Reached the 8192 tile.', icon: '✨', legendary: true },
        { id: 'high_jumper', title: 'High Jumper', desc: 'Reached 10000 height in Neon Jump.', icon: '🚀', ultra: true },
        { id: 'sky_master', title: 'Sky Master', desc: 'Reached 25000 height in Neon Jump.', icon: '🚀', legendary: true },
        { id: 'mole_slayer', title: 'Mole Slayer', desc: 'Scored 200 points in Whack-A-Mole.', icon: '🔨', ultra: true },
        { id: 'mole_destroyer', title: 'Mole Destroyer', desc: 'Scored 500 points in Whack-A-Mole.', icon: '🔨', legendary: true },
        { id: 'precision', title: 'Precision', desc: 'Scored 50 points in Breakout without losing a ball.', icon: '🎯', ultra: true },
        { id: 'breakout_master', title: 'Breakout Master', desc: 'Score 1000 in Breakout.', icon: '🧱', ultra: true },
        { id: 'triple_threat', title: 'Triple Threat', desc: 'Won Tic-Tac-Toe under 10 seconds.', icon: '🔥', ultra: true },
        { id: 'bulletproof', title: 'Bulletproof', desc: 'Survived 1 minute in Space Shooter without getting hit.', icon: '🧥', ultra: true },
        { id: 'space_legend', title: 'Space Legend', desc: 'Score 5000 in Space Shooter.', icon: '🚀', legendary: true },
        
        // ===== PROGRESSION ACHIEVEMENTS =====
        { id: 'warmup', title: 'Warmup Done', desc: 'Played a total of 10 games.', icon: '🔥' },
        { id: 'getting_started', title: 'Getting Started', desc: 'Played a total of 25 games.', icon: '🎮' },
        { id: 'marathon_runner', title: 'Marathon Runner', desc: 'Played a total of 50 games.', icon: '🏃', ultra: true },
        { id: 'dedicated', title: 'Dedicated', desc: 'Played a total of 75 games.', icon: '💪', ultra: true },
        { id: 'no_life', title: 'Non-Stop', desc: 'Played a total of 100 games.', icon: '⚡', ultra: true },
        { id: 'obsessed', title: 'Obsessed', desc: 'Played a total of 250 games.', icon: '🔥', legendary: true },
        { id: 'legend', title: 'Legend', desc: 'Played a total of 500 games.', icon: '👑', legendary: true },
        { id: 'immortal', title: 'Immortal', desc: 'Played a total of 1000 games.', icon: '⛩️', legendary: true },
        
        { id: 'persistent', title: 'Persistent', desc: 'Played the same game 5 times in a row.', icon: '🔄', ultra: true },
        { id: 'super_persistent', title: 'Super Persistent', desc: 'Played the same game 10 times in a row.', icon: '🔄', legendary: true },
        { id: 'explorer', title: 'Explorer', desc: 'Played 10 different games.', icon: '🗺️', ultra: true },
        { id: 'completionist', title: 'Completionist', desc: 'Played all 40 games at least once.', icon: '🎯', legendary: true },
        
        // ===== TIME-BASED ACHIEVEMENTS =====
        { id: 'night_owl', title: 'Night Owl', desc: 'Played a game after 10 PM.', icon: '🦉', ultra: true },
        { id: 'midnight_gamer', title: 'Midnight Gamer', desc: 'Played a game after midnight.', icon: '🌙', ultra: true },
        { id: 'early_bird', title: 'Early Bird', desc: 'Played a game before 8 AM.', icon: '🐤', ultra: true },
        { id: 'dawn_warrior', title: 'Dawn Warrior', desc: 'Played a game before 6 AM.', icon: '🌅', legendary: true },
        { id: 'weekend_warrior', title: 'Weekend Warrior', desc: 'Played a game on Saturday or Sunday.', icon: '⚔️', ultra: true },
        { id: 'weekday_grinder', title: 'Weekday Grinder', desc: 'Played games 5 weekdays in a row.', icon: '💼', ultra: true },
        { id: 'daily_player', title: 'Daily Player', desc: 'Played at least one game every day for a week.', icon: '📅', legendary: true },
        { id: 'monthly_champion', title: 'Monthly Champion', desc: 'Played at least one game every day for 30 days.', icon: '🗓️', legendary: true },
        
        // ===== PLAYTIME ACHIEVEMENTS =====
        { id: 'quick_break', title: 'Quick Break', desc: 'Total playtime exceeded 10 minutes.', icon: '⏱️' },
        { id: 'casual_gamer', title: 'Casual Gamer', desc: 'Total playtime exceeded 30 minutes.', icon: '🎮' },
        { id: 'addict', title: 'Addict', desc: 'Total playtime exceeded 1 hour.', icon: '💊', ultra: true },
        { id: 'hardcore', title: 'Hardcore', desc: 'Total playtime exceeded 3 hours.', icon: '🔥', ultra: true },
        { id: 'no_sleep', title: 'No Sleep', desc: 'Total playtime exceeded 10 hours.', icon: '😴', legendary: true },
        { id: 'time_traveler', title: 'Time Traveler', desc: 'Total playtime exceeded 24 hours.', icon: '⏰', legendary: true },
        
        // ===== COLLECTION ACHIEVEMENTS =====
        { id: 'collector', title: 'Collector', desc: 'Unlocked 15 achievements.', icon: '👑', ultra: true },
        { id: 'achievement_hunter', title: 'Achievement Hunter', desc: 'Unlocked 30 achievements.', icon: '🏹', ultra: true },
        { id: 'completionist_achievements', title: 'Achievement Master', desc: 'Unlocked 50 achievements.', icon: '🎖️', legendary: true },
        { id: 'godly', title: 'Godly', desc: 'Unlocked all achievements.', icon: '⛩️', legendary: true },
        
        // ===== SOCIAL & UI ACHIEVEMENTS =====
        { id: 'socialite', title: 'Socialite', desc: 'Switched tabs 10 times.', icon: '📱', ultra: true },
        { id: 'tab_master', title: 'Tab Master', desc: 'Switched tabs 50 times.', icon: '📑', legendary: true },
        { id: 'theme_collector', title: 'Theme Collector', desc: 'Tried all available themes.', icon: '🎨', ultra: true },
        { id: 'settings_master', title: 'Settings Master', desc: 'Changed every setting at least once.', icon: '⚙️', ultra: true },
        { id: 'favorite_collector', title: 'Favorite Collector', desc: 'Marked 10 games as favorites.', icon: '❤️', ultra: true },
        { id: 'search_master', title: 'Search Master', desc: 'Used the search bar 25 times.', icon: '🔍', ultra: true },
        
        // ===== SPECIAL & HIDDEN ACHIEVEMENTS =====
        { id: 'lucky_seven', title: 'Lucky Seven', desc: 'Score exactly 777 points in any game.', icon: '🎰', hidden: true },
        { id: 'perfect_score', title: 'Perfect Score', desc: 'Score exactly 1000 points in any game.', icon: '💯', hidden: true },
        { id: 'close_call', title: 'Close Call', desc: 'Survive with 1 HP in any game.', icon: '❤️‍🩹', hidden: true },
        { id: 'instant_death', title: 'Instant Death', desc: 'Die within 3 seconds of starting a game.', icon: '💀', hidden: true },
        { id: 'rage_quit', title: 'Rage Quit', desc: 'Exit a game within 5 seconds 3 times.', icon: '😤', hidden: true },
        { id: 'comeback', title: 'Comeback', desc: 'Beat your high score after 20 failed attempts.', icon: '🔥', hidden: true },
        { id: 'perfectionist', title: 'Perfectionist', desc: 'Restart a game 10 times without finishing.', icon: '🔄', hidden: true },
        { id: 'speed_demon', title: 'Speed Demon', desc: 'Complete any game in under 30 seconds.', icon: '⚡', hidden: true },
        { id: 'slow_and_steady', title: 'Slow and Steady', desc: 'Play a single game for over 10 minutes.', icon: '🐢', hidden: true },
        { id: 'multitasker', title: 'Multitasker', desc: 'Switch between 5 different games in 2 minutes.', icon: '🎭', hidden: true },

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
            favoriteBtn.dataset.gameId = config.id;

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
        const totalGames = GAME_CARDS_CONFIG.length;
        const uniqueGames = (gm.uniqueGamesPlayed || []).length;
        const totalPlaytime = gm.totalPlayTime || 0;
        
        // Calculate total and average scores
        let totalScore = 0;
        let scoreCount = 0;
        GAME_CARDS_CONFIG.forEach(config => {
            const score = gm.getHighScore(config.id);
            if (score > 0) {
                totalScore += score;
                scoreCount++;
            }
        });
        const avgScore = scoreCount > 0 ? Math.floor(totalScore / scoreCount) : 0;
        
        // Calculate games per hour (estimate based on playtime)
        const hoursPlayed = totalPlaytime / 3600;
        const gamesPerHour = hoursPlayed > 0 ? (gm.totalGamesPlayed / hoursPlayed).toFixed(1) : 0;
        
        // Calculate active days (estimate from unique games)
        const activeDays = uniqueGames > 0 ? Math.max(1, Math.floor(uniqueGames / 2)) : 0;
        
        // Update stat cards with progress bars
        statTotalPlayed.textContent = gm.totalGamesPlayed;
        statAchievementsCount.textContent = `${unlocked.length}/${ALL_ACHIEVEMENTS.length}`;
        
        // Update new stat cards
        const statTotalScore = document.getElementById('stat-total-score');
        const statAvgScore = document.getElementById('stat-avg-score');
        const statGamesPerHour = document.getElementById('stat-games-hour');
        const statDaysActive = document.getElementById('stat-days-active');
        
        if (statTotalScore) statTotalScore.textContent = totalScore.toLocaleString();
        if (statAvgScore) statAvgScore.textContent = avgScore.toLocaleString();
        if (statGamesPerHour) statGamesPerHour.textContent = gamesPerHour;
        if (statDaysActive) statDaysActive.textContent = activeDays;
        
        // Update stat progress bars
        const totalProgress = document.getElementById('stat-total-progress');
        const achievementsProgress = document.getElementById('stat-achievements-progress');
        const favoritesProgress = document.getElementById('stat-favorites-progress');
        const playtimeProgress = document.getElementById('stat-playtime-progress');
        const uniqueProgress = document.getElementById('stat-unique-progress');
        const streakProgress = document.getElementById('stat-streak-progress');
        const totalScoreProgress = document.getElementById('stat-total-score-progress');
        const avgScoreProgress = document.getElementById('stat-avg-score-progress');
        const gamesHourProgress = document.getElementById('stat-games-hour-progress');
        const daysActiveProgress = document.getElementById('stat-days-active-progress');
        
        if (totalProgress) {
            const totalPercent = Math.min((gm.totalGamesPlayed / 100) * 100, 100);
            totalProgress.style.width = `${totalPercent}%`;
        }
        
        if (achievementsProgress) {
            const achievementPercent = (unlocked.length / ALL_ACHIEVEMENTS.length) * 100;
            achievementsProgress.style.width = `${achievementPercent}%`;
        }
        
        if (totalScoreProgress) {
            const scorePercent = Math.min((totalScore / 10000) * 100, 100);
            totalScoreProgress.style.width = `${scorePercent}%`;
        }
        
        if (avgScoreProgress) {
            const avgPercent = Math.min((avgScore / 1000) * 100, 100);
            avgScoreProgress.style.width = `${avgPercent}%`;
        }
        
        if (gamesHourProgress) {
            const gamesHourPercent = Math.min((parseFloat(gamesPerHour) / 10) * 100, 100);
            gamesHourProgress.style.width = `${gamesHourPercent}%`;
        }
        
        if (daysActiveProgress) {
            const daysActivePercent = Math.min((activeDays / 30) * 100, 100);
            daysActiveProgress.style.width = `${daysActivePercent}%`;
        }
        
        // Update favorites
        const statFavorites = document.getElementById('stat-favorites');
        if (statFavorites) {
            const favCount = (gm.favorites || []).length;
            statFavorites.textContent = favCount;
            if (favoritesProgress) {
                const favPercent = (favCount / totalGames) * 100;
                favoritesProgress.style.width = `${favPercent}%`;
            }
        }
        
        // Update playtime
        const statPlaytime = document.getElementById('stat-playtime');
        if (statPlaytime) {
            const totalMinutes = Math.floor(totalPlaytime / 60);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            statPlaytime.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            if (playtimeProgress) {
                const playtimePercent = Math.min((totalMinutes / 180) * 100, 100);
                playtimeProgress.style.width = `${playtimePercent}%`;
            }
        }
        
        // Update unique games
        const statUniqueGames = document.getElementById('stat-unique-games');
        if (statUniqueGames) {
            statUniqueGames.textContent = uniqueGames;
            if (uniqueProgress) {
                const uniquePercent = (uniqueGames / totalGames) * 100;
                uniqueProgress.style.width = `${uniquePercent}%`;
            }
        }
        
        // Update streak
        const statStreak = document.getElementById('stat-streak');
        if (statStreak) {
            const streak = gm.consecutiveGames || 0;
            statStreak.textContent = streak;
            if (streakProgress) {
                const streakPercent = Math.min((streak / 10) * 100, 100);
                streakProgress.style.width = `${streakPercent}%`;
            }
        }
        
        // Update hero stats
        updateHeroStats(gm.totalGamesPlayed, unlocked.length, totalPlaytime, gm.consecutiveGames || 0);
        
        // Render all sections
        renderQuickSummary();
        renderTopGames();
        renderRecentActivity();
        renderCategoryStats();
        renderPlayTimeChart();
        renderAchievementProgress(unlocked);
        renderMilestones();
        renderAchievementsList(unlocked);
        setupAchievementFilter();
    }
    
    function updateHeroStats(totalGames, achievements, playtime, streak) {
        const heroTotalGames = document.getElementById('hero-total-games');
        const heroAchievements = document.getElementById('hero-achievements');
        const heroAchievementsPercent = document.getElementById('hero-achievements-percent');
        const heroPlaytime = document.getElementById('hero-playtime');
        const heroStreak = document.getElementById('hero-streak');
        
        if (heroTotalGames) heroTotalGames.textContent = totalGames.toLocaleString();
        if (heroAchievements) heroAchievements.textContent = achievements;
        if (heroAchievementsPercent) {
            const percent = (achievements / ALL_ACHIEVEMENTS.length) * 100;
            heroAchievementsPercent.textContent = `${percent.toFixed(1)}%`;
        }
        if (heroPlaytime) {
            const totalMinutes = Math.floor(playtime / 60);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            heroPlaytime.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }
        if (heroStreak) heroStreak.textContent = streak;
    }
    
    function renderTopGames() {
        const topGamesList = document.getElementById('top-games-list');
        if (!topGamesList) return;
        
        // Get all games with high scores
        const gamesWithScores = GAME_CARDS_CONFIG
            .map(config => ({
                ...config,
                highScore: gm.getHighScore(config.id) || 0
            }))
            .filter(game => game.highScore > 0)
            .sort((a, b) => b.highScore - a.highScore)
            .slice(0, 10);
        
        if (gamesWithScores.length === 0) {
            topGamesList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No high scores yet. Start playing!</div>';
            return;
        }
        
        topGamesList.innerHTML = '';
        gamesWithScores.forEach((game, index) => {
            const item = document.createElement('div');
            item.className = 'top-game-item';
            
            let rankClass = '';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';
            
            // Determine score level
            let scoreLevel = '';
            if (game.highScore >= 1000) scoreLevel = '🔥';
            else if (game.highScore >= 500) scoreLevel = '⭐';
            else if (game.highScore >= 100) scoreLevel = '👍';
            
            item.innerHTML = `
                <div class="top-game-rank ${rankClass}">#${index + 1}</div>
                <div class="top-game-icon">${game.icon}</div>
                <div class="top-game-info">
                    <div class="top-game-name">${game.name}</div>
                    <div class="top-game-category">${game.category} ${scoreLevel}</div>
                </div>
                <div class="top-game-score">${game.highScore}</div>
            `;
            
            item.addEventListener('click', () => {
                openGame(game.id, game.name, game.icon);
            });
            
            topGamesList.appendChild(item);
        });
    }
    
    function renderCategoryStats() {
        const categoryStats = document.getElementById('category-stats');
        if (!categoryStats) return;
        
        // Count games by category
        const categories = {};
        GAME_CARDS_CONFIG.forEach(game => {
            if (!categories[game.category]) {
                categories[game.category] = { count: 0, played: 0, totalScore: 0 };
            }
            categories[game.category].count++;
            if ((gm.uniqueGamesPlayed || []).includes(game.id)) {
                categories[game.category].played++;
            }
            // Add total score for category
            const score = gm.getHighScore(game.id);
            if (score > 0) {
                categories[game.category].totalScore += score;
            }
        });
        
        categoryStats.innerHTML = '';
        Object.entries(categories).forEach(([category, data]) => {
            const percent = (data.played / data.count) * 100;
            const card = document.createElement('div');
            card.className = 'category-stat-card';
            card.innerHTML = `
                <div class="category-stat-header">
                    <div class="category-stat-name">${category}</div>
                    <div class="category-stat-count">${data.played}/${data.count}</div>
                </div>
                <div class="category-stat-bar">
                    <div class="category-stat-fill" style="width: ${percent}%"></div>
                </div>
                <div class="category-stat-footer">
                    <span class="category-stat-label">Total Score:</span>
                    <span class="category-stat-score">${data.totalScore.toLocaleString()}</span>
                </div>
            `;
            categoryStats.appendChild(card);
        });
    }
    
    function renderAchievementProgress(unlocked) {
        // Count achievements by type
        const normal = ALL_ACHIEVEMENTS.filter(a => !a.ultra && !a.hidden);
        const ultra = ALL_ACHIEVEMENTS.filter(a => a.ultra);
        const hidden = ALL_ACHIEVEMENTS.filter(a => a.hidden);
        
        const normalUnlocked = normal.filter(a => unlocked.includes(a.id)).length;
        const ultraUnlocked = ultra.filter(a => unlocked.includes(a.id)).length;
        const hiddenUnlocked = hidden.filter(a => unlocked.includes(a.id)).length;
        
        // Update progress bars
        const normalProgress = document.getElementById('achievement-normal-progress');
        const ultraProgress = document.getElementById('achievement-ultra-progress');
        const hiddenProgress = document.getElementById('achievement-hidden-progress');
        
        const normalText = document.getElementById('achievement-normal-text');
        const ultraText = document.getElementById('achievement-ultra-text');
        const hiddenText = document.getElementById('achievement-hidden-text');
        
        if (normalProgress && normalText) {
            const percent = normal.length > 0 ? (normalUnlocked / normal.length) * 100 : 0;
            normalProgress.style.width = `${percent}%`;
            normalText.textContent = `${normalUnlocked}/${normal.length} (${percent.toFixed(0)}%)`;
        }
        
        if (ultraProgress && ultraText) {
            const percent = ultra.length > 0 ? (ultraUnlocked / ultra.length) * 100 : 0;
            ultraProgress.style.width = `${percent}%`;
            ultraText.textContent = `${ultraUnlocked}/${ultra.length} (${percent.toFixed(0)}%)`;
        }
        
        if (hiddenProgress && hiddenText) {
            const percent = hidden.length > 0 ? (hiddenUnlocked / hidden.length) * 100 : 0;
            hiddenProgress.style.width = `${percent}%`;
            hiddenText.textContent = `${hiddenUnlocked}/${hidden.length} (${percent.toFixed(0)}%)`;
        }
    }
    
    function renderAchievementsList(unlocked, filter = 'all') {
        achievementsList.innerHTML = '';
        
        let filteredAchievements = ALL_ACHIEVEMENTS;
        
        if (filter === 'unlocked') {
            filteredAchievements = ALL_ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
        } else if (filter === 'locked') {
            filteredAchievements = ALL_ACHIEVEMENTS.filter(a => !unlocked.includes(a.id));
        } else if (filter === 'ultra') {
            filteredAchievements = ALL_ACHIEVEMENTS.filter(a => a.ultra);
        } else if (filter === 'hidden') {
            filteredAchievements = ALL_ACHIEVEMENTS.filter(a => a.hidden);
        }
        
        filteredAchievements.forEach(a => {
            const isUnlocked = unlocked.includes(a.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''} ${a.ultra ? 'ultra' : ''}`;
            const isHiddenLocked = a.hidden && !isUnlocked;
            const title = isHiddenLocked ? 'Hidden Achievement' : a.title;
            const icon = isHiddenLocked ? '❔' : a.icon;
            
            // Add rarity badge
            let rarityBadge = '';
            if (a.ultra) rarityBadge = '<span class="achievement-rarity-badge ultra">ULTRA</span>';
            else if (a.hidden) rarityBadge = '<span class="achievement-rarity-badge hidden">HIDDEN</span>';
            else rarityBadge = '<span class="achievement-rarity-badge normal">NORMAL</span>';
            
            item.innerHTML = `
                <span class="achievement-item-icon">${icon}</span>
                <div class="achievement-item-text">
                    <span class="achievement-item-title">${title}</span>
                    ${rarityBadge}
                </div>
            `;
            achievementsList.appendChild(item);
        });
    }
    
    function setupAchievementFilter() {
        const filterBtns = document.querySelectorAll('.achievement-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                const unlocked = gm.achievements || [];
                renderAchievementsList(unlocked, filter);
            });
        });
    }
    
    function renderQuickSummary() {
        const gameCounts = {};
        (gm.uniqueGamesPlayed || []).forEach(gameId => {
            gameCounts[gameId] = (gameCounts[gameId] || 0) + 1;
        });
        
        let mostPlayedId = null;
        let maxCount = 0;
        Object.entries(gameCounts).forEach(([gameId, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostPlayedId = gameId;
            }
        });
        
        const mostPlayedGame = mostPlayedId ? GAME_CARDS_CONFIG.find(g => g.id === mostPlayedId) : null;
        
        let bestGame = null;
        let bestScore = 0;
        GAME_CARDS_CONFIG.forEach(config => {
            const score = gm.getHighScore(config.id);
            if (score > bestScore) {
                bestScore = score;
                bestGame = config;
            }
        });
        
        // Find most recent game
        let mostRecentGame = null;
        let mostRecentTime = 0;
        GAME_CARDS_CONFIG.forEach(config => {
            const lastPlayed = (gm.lastPlayed && gm.lastPlayed[config.id]) || 0;
            if (lastPlayed > mostRecentTime) {
                mostRecentTime = lastPlayed;
                mostRecentGame = config;
            }
        });
        
        const longestSession = Math.floor((gm.totalPlayTime || 0) / 60);
        const daysPlayed = gm.uniqueGamesPlayed ? Math.max(1, Math.floor(gm.uniqueGamesPlayed.length / 3)) : 0;
        
        const quickMostPlayed = document.getElementById('quick-most-played-game');
        const quickBestGame = document.getElementById('quick-best-game');
        const quickBestScore = document.getElementById('quick-best-score');
        const quickLastPlayed = document.getElementById('quick-last-played');
        
        if (quickMostPlayed) {
            quickMostPlayed.textContent = mostPlayedGame ? `${mostPlayedGame.icon} ${mostPlayedGame.name}` : '-';
        }
        if (quickBestGame) {
            quickBestGame.textContent = bestGame ? `${bestGame.icon} ${bestGame.name}` : '-';
        }
        if (quickBestScore) {
            quickBestScore.textContent = bestScore.toLocaleString();
        }
        if (quickLastPlayed) {
            if (mostRecentGame && mostRecentTime > 0) {
                const timeAgo = Date.now() - mostRecentTime;
                const minutes = Math.floor(timeAgo / 60000);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                
                let timeText = '';
                if (days > 0) timeText = `${days}d ago`;
                else if (hours > 0) timeText = `${hours}h ago`;
                else if (minutes > 0) timeText = `${minutes}m ago`;
                else timeText = 'Just now';
                
                quickLastPlayed.textContent = `${mostRecentGame.icon} ${timeText}`;
            } else {
                quickLastPlayed.textContent = '-';
            }
        }
    }
    
    function renderRecentActivity() {
        const recentActivityList = document.getElementById('recent-activity-list');
        if (!recentActivityList) return;
        
        const recentGames = GAME_CARDS_CONFIG
            .map(config => ({
                ...config,
                lastPlayed: (gm.lastPlayed && gm.lastPlayed[config.id]) || 0,
                highScore: gm.getHighScore(config.id) || 0
            }))
            .filter(game => game.lastPlayed > 0)
            .sort((a, b) => b.lastPlayed - a.lastPlayed)
            .slice(0, 10);
        
        if (recentGames.length === 0) {
            recentActivityList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No recent activity</div>';
            return;
        }
        
        recentActivityList.innerHTML = '';
        recentGames.forEach(game => {
            const item = document.createElement('div');
            item.className = 'recent-activity-item';
            
            const timeAgo = Date.now() - game.lastPlayed;
            const minutes = Math.floor(timeAgo / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            let timeText = '';
            if (days > 0) timeText = `${days}d ago`;
            else if (hours > 0) timeText = `${hours}h ago`;
            else if (minutes > 0) timeText = `${minutes}m ago`;
            else timeText = 'Just now';
            
            // Determine score level
            let scoreLevel = '';
            if (game.highScore >= 1000) scoreLevel = '🔥';
            else if (game.highScore >= 500) scoreLevel = '⭐';
            else if (game.highScore >= 100) scoreLevel = '👍';
            
            item.innerHTML = `
                <div class="recent-activity-icon">${game.icon}</div>
                <div class="recent-activity-info">
                    <div class="recent-activity-game">${game.name}</div>
                    <div class="recent-activity-details">${scoreLevel} Score: ${game.highScore} • ${game.category}</div>
                </div>
                <div class="recent-activity-time">${timeText}</div>
            `;
            
            recentActivityList.appendChild(item);
        });
    }
    
    function renderPlayTimeChart() {
        const playtimeChart = document.getElementById('playtime-chart');
        if (!playtimeChart) return;
        
        const categoryPlaytime = {};
        GAME_CARDS_CONFIG.forEach(game => {
            if (!categoryPlaytime[game.category]) {
                categoryPlaytime[game.category] = 0;
            }
            if ((gm.uniqueGamesPlayed || []).includes(game.id)) {
                categoryPlaytime[game.category] += 1;
            }
        });
        
        const maxPlaytime = Math.max(...Object.values(categoryPlaytime), 1);
        
        playtimeChart.innerHTML = '';
        Object.entries(categoryPlaytime).forEach(([category, playtime]) => {
            const percent = (playtime / maxPlaytime) * 100;
            const item = document.createElement('div');
            item.className = 'playtime-chart-item';
            item.innerHTML = `
                <div class="playtime-chart-label">${category.toUpperCase()}</div>
                <div class="playtime-chart-bar-container">
                    <div class="playtime-chart-bar" style="width: ${percent}%">
                        <span class="playtime-chart-value">${playtime} games</span>
                    </div>
                </div>
            `;
            playtimeChart.appendChild(item);
        });
    }
    
    function renderMilestones() {
        const milestonesGrid = document.getElementById('milestones-grid');
        if (!milestonesGrid) return;
        
        const milestones = [
            { icon: '🎮', title: 'First Steps', desc: 'Play 10 games', current: gm.totalGamesPlayed, target: 10 },
            { icon: '🏆', title: 'Achievement Hunter', desc: 'Unlock 10 achievements', current: (gm.achievements || []).length, target: 10 },
            { icon: '⭐', title: 'Favorite Collector', desc: 'Add 5 favorites', current: (gm.favorites || []).length, target: 5 },
            { icon: '⏱️', title: 'Time Traveler', desc: 'Play for 1 hour', current: Math.floor((gm.totalPlayTime || 0) / 60), target: 60 },
            { icon: '🎯', title: 'Explorer', desc: 'Try 20 different games', current: (gm.uniqueGamesPlayed || []).length, target: 20 },
            { icon: '🔥', title: 'Streak Master', desc: 'Reach 5 game streak', current: gm.consecutiveGames || 0, target: 5 },
            { icon: '💯', title: 'Century Club', desc: 'Play 100 games', current: gm.totalGamesPlayed, target: 100 },
            { icon: '👑', title: 'Champion', desc: 'Score 10,000 total points', current: GAME_CARDS_CONFIG.reduce((sum, g) => sum + (gm.getHighScore(g.id) || 0), 0), target: 10000 },
            { icon: '⚡', title: 'Speedster', desc: 'Play 500 games', current: gm.totalGamesPlayed, target: 500 },
            { icon: '🌟', title: 'Master', desc: 'Unlock 50 achievements', current: (gm.achievements || []).length, target: 50 },
            { icon: '💎', title: 'Diamond', desc: 'Play for 10 hours', current: Math.floor((gm.totalPlayTime || 0) / 60), target: 600 },
            { icon: '🚀', title: 'Rocket', desc: 'Score 50,000 total points', current: GAME_CARDS_CONFIG.reduce((sum, g) => sum + (gm.getHighScore(g.id) || 0), 0), target: 50000 }
        ];
        
        milestonesGrid.innerHTML = '';
        milestones.forEach(milestone => {
            const percent = Math.min((milestone.current / milestone.target) * 100, 100);
            const completed = milestone.current >= milestone.target;
            
            const card = document.createElement('div');
            card.className = `milestone-card ${completed ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="milestone-header">
                    <div class="milestone-icon">${milestone.icon}</div>
                    <div class="milestone-info">
                        <div class="milestone-title">${milestone.title}</div>
                        <div class="milestone-desc">${milestone.desc}</div>
                    </div>
                </div>
                <div class="milestone-progress">
                    <div class="milestone-progress-bar">
                        <div class="milestone-progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="milestone-progress-text">${milestone.current} / ${milestone.target}</div>
                </div>
            `;
            milestonesGrid.appendChild(card);
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
        
        // Apply new settings to UI
        const particleDensityEl = document.getElementById('settings-particle-density');
        const particleValueEl = document.getElementById('settings-particle-value');
        if (particleDensityEl && settings.particleDensity !== undefined) {
            particleDensityEl.value = settings.particleDensity;
            if (particleValueEl) particleValueEl.textContent = `${Math.round(settings.particleDensity * 100)}%`;
        }
        
        const glowIntensityEl = document.getElementById('settings-glow-intensity');
        const glowValueEl = document.getElementById('settings-glow-value');
        if (glowIntensityEl && settings.glowIntensity !== undefined) {
            glowIntensityEl.value = settings.glowIntensity;
            if (glowValueEl) glowValueEl.textContent = `${Math.round(settings.glowIntensity * 100)}%`;
            document.documentElement.style.setProperty('--glow-multiplier', settings.glowIntensity);
        }
        
        const animSpeedEl = document.getElementById('settings-anim-speed');
        const animValueEl = document.getElementById('settings-anim-value');
        if (animSpeedEl && settings.animSpeed !== undefined) {
            animSpeedEl.value = settings.animSpeed;
            if (animValueEl) animValueEl.textContent = `${Math.round(settings.animSpeed * 100)}%`;
        }
        
        const showFPSEl = document.getElementById('settings-show-fps');
        if (showFPSEl) showFPSEl.checked = !!settings.showFPS;
        
        const screenFlashEl = document.getElementById('settings-screen-flash');
        if (screenFlashEl) screenFlashEl.checked = settings.screenFlash !== false;
        
        const sfxVolumeEl = document.getElementById('settings-sfx-volume');
        const sfxValueEl = document.getElementById('settings-sfx-value');
        if (sfxVolumeEl && settings.sfxVolume !== undefined) {
            sfxVolumeEl.value = settings.sfxVolume;
            if (sfxValueEl) sfxValueEl.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
        }
        
        const musicVolumeEl = document.getElementById('settings-music-volume');
        const musicValueEl = document.getElementById('settings-music-value');
        if (musicVolumeEl && settings.musicVolume !== undefined) {
            musicVolumeEl.value = settings.musicVolume;
            if (musicValueEl) musicValueEl.textContent = `${Math.round(settings.musicVolume * 100)}%`;
        }
        
        const muteOnBlurEl = document.getElementById('settings-mute-on-blur');
        if (muteOnBlurEl) muteOnBlurEl.checked = settings.muteOnBlur !== false;
        
        const autoPauseEl = document.getElementById('settings-auto-pause');
        if (autoPauseEl) autoPauseEl.checked = !!settings.autoPause;
        
        const confirmExitEl = document.getElementById('settings-confirm-exit');
        if (confirmExitEl) confirmExitEl.checked = !!settings.confirmExit;
        
        const showTimerEl = document.getElementById('settings-show-timer');
        if (showTimerEl) showTimerEl.checked = settings.showTimer !== false;
        
        const difficultyEl = document.getElementById('settings-difficulty');
        if (difficultyEl) {
            difficultyEl.value = settings.difficulty || 'normal';
        }
        
        const compactModeEl = document.getElementById('settings-compact-mode');
        if (compactModeEl) {
            compactModeEl.checked = !!settings.compactMode;
            gamesGrid.classList.toggle('compact-mode', !!settings.compactMode);
        }
        
        const showDescriptionsEl = document.getElementById('settings-show-descriptions');
        if (showDescriptionsEl) {
            showDescriptionsEl.checked = settings.showDescriptions !== false;
            document.querySelectorAll('.game-card-desc').forEach(el => {
                el.style.display = settings.showDescriptions !== false ? 'block' : 'none';
            });
        }
        
        const achievementNotificationsEl = document.getElementById('settings-achievement-notifications');
        if (achievementNotificationsEl) achievementNotificationsEl.checked = settings.achievementNotifications !== false;
        
        const cardSizeEl = document.getElementById('settings-card-size');
        const cardSizeValueEl = document.getElementById('settings-card-size-value');
        if (cardSizeEl && settings.cardSize !== undefined) {
            cardSizeEl.value = settings.cardSize;
            if (cardSizeValueEl) cardSizeValueEl.textContent = `${Math.round(settings.cardSize * 100)}%`;
            document.documentElement.style.setProperty('--card-scale', settings.cardSize);
        }
        
        // Grid Layout
        const gridLayoutEl = document.getElementById('settings-grid-layout');
        if (gridLayoutEl && settings.gridLayout) {
            gridLayoutEl.value = settings.gridLayout;
            if (settings.gridLayout !== 'auto') {
                gamesGrid.setAttribute('data-grid-layout', settings.gridLayout);
            }
        }
        
        // Dark Mode
        const darkModeEl = document.getElementById('settings-dark-mode');
        if (darkModeEl && settings.darkMode !== undefined) {
            darkModeEl.checked = settings.darkMode;
            document.documentElement.setAttribute('data-dark-mode', settings.darkMode);
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

    // NEW SETTINGS HANDLERS
    
    // Particle Density
    const settingsParticleDensity = document.getElementById('settings-particle-density');
    const settingsParticleValue = document.getElementById('settings-particle-value');
    if (settingsParticleDensity) {
        settingsParticleDensity.addEventListener('input', () => {
            const val = parseFloat(settingsParticleDensity.value || '1');
            if (settingsParticleValue) {
                settingsParticleValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({ particleDensity: val });
        });
    }
    
    // Glow Intensity
    const settingsGlowIntensity = document.getElementById('settings-glow-intensity');
    const settingsGlowValue = document.getElementById('settings-glow-value');
    if (settingsGlowIntensity) {
        settingsGlowIntensity.addEventListener('input', () => {
            const val = parseFloat(settingsGlowIntensity.value || '1');
            if (settingsGlowValue) {
                settingsGlowValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({ glowIntensity: val });
            // Apply glow intensity to document
            document.documentElement.style.setProperty('--glow-multiplier', val);
        });
    }
    
    // Animation Speed
    const settingsAnimSpeed = document.getElementById('settings-anim-speed');
    const settingsAnimValue = document.getElementById('settings-anim-value');
    if (settingsAnimSpeed) {
        settingsAnimSpeed.addEventListener('input', () => {
            const val = parseFloat(settingsAnimSpeed.value || '1');
            if (settingsAnimValue) {
                settingsAnimValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({ animSpeed: val });
        });
    }
    
    // Show FPS
    const settingsShowFPS = document.getElementById('settings-show-fps');
    const fpsCounter = document.getElementById('fps-counter');
    if (settingsShowFPS) {
        settingsShowFPS.addEventListener('change', () => {
            const show = settingsShowFPS.checked;
            gm.updateSettings && gm.updateSettings({ showFPS: show });
            if (fpsCounter) {
                fpsCounter.classList.toggle('hidden', !show);
            }
            if (show) {
                startFPSCounter();
            } else {
                stopFPSCounter();
            }
        });
    }
    
    // Screen Flash
    const settingsScreenFlash = document.getElementById('settings-screen-flash');
    if (settingsScreenFlash) {
        settingsScreenFlash.addEventListener('change', () => {
            gm.updateSettings && gm.updateSettings({ screenFlash: settingsScreenFlash.checked });
        });
    }
    
    // SFX Volume
    const settingsSFXVolume = document.getElementById('settings-sfx-volume');
    const settingsSFXValue = document.getElementById('settings-sfx-value');
    if (settingsSFXVolume) {
        settingsSFXVolume.addEventListener('input', () => {
            const val = parseFloat(settingsSFXVolume.value || '1');
            if (settingsSFXValue) {
                settingsSFXValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({ sfxVolume: val });
            if (window.soundManager) window.soundManager.setSFXVolume(val);
        });
    }
    
    // Music Volume
    const settingsMusicVolume = document.getElementById('settings-music-volume');
    const settingsMusicValue = document.getElementById('settings-music-value');
    if (settingsMusicVolume) {
        settingsMusicVolume.addEventListener('input', () => {
            const val = parseFloat(settingsMusicVolume.value || '0.5');
            if (settingsMusicValue) {
                settingsMusicValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({ musicVolume: val });
            if (window.soundManager) window.soundManager.setMusicVolume(val);
        });
    }
    
    // Mute on Blur
    const settingsMuteOnBlur = document.getElementById('settings-mute-on-blur');
    if (settingsMuteOnBlur) {
        settingsMuteOnBlur.addEventListener('change', () => {
            gm.updateSettings && gm.updateSettings({ muteOnBlur: settingsMuteOnBlur.checked });
        });
    }
    
    // Auto Pause
    const settingsAutoPause = document.getElementById('settings-auto-pause');
    if (settingsAutoPause) {
        settingsAutoPause.addEventListener('change', () => {
            gm.updateSettings && gm.updateSettings({ autoPause: settingsAutoPause.checked });
        });
    }
    
    // Confirm Exit
    const settingsConfirmExit = document.getElementById('settings-confirm-exit');
    if (settingsConfirmExit) {
        settingsConfirmExit.addEventListener('change', () => {
            gm.updateSettings && gm.updateSettings({ confirmExit: settingsConfirmExit.checked });
        });
    }
    
    // Show Timer
    const settingsShowTimer = document.getElementById('settings-show-timer');
    if (settingsShowTimer) {
        settingsShowTimer.addEventListener('change', () => {
            gm.updateSettings && gm.updateSettings({ showTimer: settingsShowTimer.checked });
        });
    }
    
    // Difficulty
    const settingsDifficulty = document.getElementById('settings-difficulty');
    if (settingsDifficulty) {
        settingsDifficulty.addEventListener('change', () => {
            console.log(`[Launcher] Difficulty changed to: ${settingsDifficulty.value}`);
            gm.updateSettings && gm.updateSettings({ difficulty: settingsDifficulty.value });
        });
    }
    
    // Compact Mode
    const settingsCompactMode = document.getElementById('settings-compact-mode');
    if (settingsCompactMode) {
        settingsCompactMode.addEventListener('change', () => {
            const compact = settingsCompactMode.checked;
            gm.updateSettings && gm.updateSettings({ compactMode: compact });
            gamesGrid.classList.toggle('compact-mode', compact);
        });
    }
    
    // Show Descriptions
    const settingsShowDescriptions = document.getElementById('settings-show-descriptions');
    if (settingsShowDescriptions) {
        settingsShowDescriptions.addEventListener('change', () => {
            const show = settingsShowDescriptions.checked;
            gm.updateSettings && gm.updateSettings({ showDescriptions: show });
            document.querySelectorAll('.game-card-desc').forEach(el => {
                el.style.display = show ? 'block' : 'none';
            });
        });
    }
    
    // Achievement Notifications
    const settingsAchievementNotifications = document.getElementById('settings-achievement-notifications');
    if (settingsAchievementNotifications) {
        settingsAchievementNotifications.addEventListener('change', () => {
            gm.updateSettings && gm.updateSettings({ achievementNotifications: settingsAchievementNotifications.checked });
        });
    }
    
    // Card Size
    const settingsCardSize = document.getElementById('settings-card-size');
    const settingsCardSizeValue = document.getElementById('settings-card-size-value');
    if (settingsCardSize) {
        settingsCardSize.addEventListener('input', () => {
            const val = parseFloat(settingsCardSize.value || '1');
            if (settingsCardSizeValue) {
                settingsCardSizeValue.textContent = `${Math.round(val * 100)}%`;
            }
            gm.updateSettings && gm.updateSettings({ cardSize: val });
            document.documentElement.style.setProperty('--card-scale', val);
        });
    }
    
    // Grid Layout
    const settingsGridLayout = document.getElementById('settings-grid-layout');
    if (settingsGridLayout) {
        settingsGridLayout.addEventListener('change', () => {
            const layout = settingsGridLayout.value;
            gm.updateSettings && gm.updateSettings({ gridLayout: layout });
            if (layout === 'auto') {
                gamesGrid.removeAttribute('data-grid-layout');
            } else {
                gamesGrid.setAttribute('data-grid-layout', layout);
            }
        });
    }
    
    // Dark Mode Toggle
    const settingsDarkMode = document.getElementById('settings-dark-mode');
    if (settingsDarkMode) {
        settingsDarkMode.addEventListener('change', () => {
            const isDark = settingsDarkMode.checked;
            gm.updateSettings && gm.updateSettings({ darkMode: isDark });
            document.documentElement.setAttribute('data-dark-mode', isDark);
        });
    }
    
    // Screenshot High Score
    const btnScreenshotHighscore = document.getElementById('btn-screenshot-highscore');
    if (btnScreenshotHighscore) {
        btnScreenshotHighscore.addEventListener('click', () => {
            generateHighScoreScreenshot();
        });
    }
    
    // Share Achievements
    const btnShareAchievements = document.getElementById('btn-share-achievements');
    if (btnShareAchievements) {
        btnShareAchievements.addEventListener('click', () => {
            shareAchievements();
        });
    }
    
    // FPS Counter Logic
    let fpsInterval = null;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    
    function startFPSCounter() {
        if (fpsInterval) return;
        
        function updateFPS() {
            const now = performance.now();
            frameCount++;
            
            if (now >= lastFrameTime + 1000) {
                fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
                frameCount = 0;
                lastFrameTime = now;
                
                if (fpsCounter) {
                    fpsCounter.textContent = `FPS: ${fps}`;
                    // Color code based on FPS
                    if (fps >= 55) {
                        fpsCounter.style.color = 'var(--accent-green)';
                    } else if (fps >= 30) {
                        fpsCounter.style.color = 'var(--accent-yellow)';
                    } else {
                        fpsCounter.style.color = 'var(--accent-red)';
                    }
                }
            }
            
            fpsInterval = requestAnimationFrame(updateFPS);
        }
        
        updateFPS();
    }
    
    function stopFPSCounter() {
        if (fpsInterval) {
            cancelAnimationFrame(fpsInterval);
            fpsInterval = null;
        }
    }
    
    // Initialize FPS counter if enabled
    const currentSettings = gm.getSettings();
    if (currentSettings.showFPS && fpsCounter) {
        fpsCounter.classList.remove('hidden');
        startFPSCounter();
    }
    
    // Track settings changes for achievements
    let settingsChangedCount = 0;
    window.addEventListener('settingsChanged', () => {
        settingsChangedCount++;
        if (settingsChangedCount === 1) {
            gm.unlockAchievement('settings_explorer', 'Tinkerer', 'You opened the settings menu.', '⚙️');
        }
    });
    
    // Track theme changes
    let themesTriedSet = new Set();
    themeButtons.forEach(btn => {
        const originalClick = btn.onclick;
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            themesTriedSet.add(theme);
            
            if (themesTriedSet.size === 1) {
                gm.unlockAchievement('theme_switcher', 'Style Master', 'You changed the theme for the first time.', '🎨');
            }
            if (themesTriedSet.size >= 11) {
                gm.unlockAchievement('theme_collector', 'Theme Collector', 'Tried all available themes.', '🎨', true);
            }
        });
    });
    
    // Track favorite additions
    const originalToggleFavorite = gm.toggleFavorite.bind(gm);
    gm.toggleFavorite = function(gameId) {
        const result = originalToggleFavorite(gameId);
        const favCount = gm.favorites.length;
        
        if (favCount === 1) {
            gm.unlockAchievement('first_favorite', 'First Love', 'You marked your first favorite game.', '❤️');
        }
        if (favCount >= 10) {
            gm.unlockAchievement('favorite_collector', 'Favorite Collector', 'Marked 10 games as favorites.', '❤️', true);
        }
        
        return result;
    };
    
    // Track search usage
    let searchCount = 0;
    gameSearch.addEventListener('input', () => {
        if (gameSearch.value.length > 0) {
            searchCount++;
            if (searchCount >= 25) {
                gm.unlockAchievement('search_master', 'Search Master', 'Used the search bar 25 times.', '🔍', true);
            }
        }
    });

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

    // Tutorial Button
    const btnTutorial = document.getElementById('btn-tutorial');
    if (btnTutorial) {
        btnTutorial.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
            if (window.tutorialSystem) {
                window.tutorialSystem.start();
            }
        });
    }

    // Event Delegation for Games Grid - Left Click
    gamesGrid.addEventListener('click', (e) => {
        const gameCard = e.target.closest('.game-card');
        if (!gameCard) return;

        const gameId = gameCard.dataset.gameId;
        const config = GAME_CARDS_CONFIG.find(g => g.id === gameId);
        if (!config) return;

        if (e.target.classList.contains('btn-favorite')) {
            e.stopPropagation();
            gm.toggleFavorite(gameId);
            sfx.play('select');
            renderGameCards(gameSearch.value);
        } else {
            openGame(gameId, config.name, config.icon);
        }
    });

    // Right-click to toggle favorite
    gamesGrid.addEventListener('contextmenu', (e) => {
        const gameCard = e.target.closest('.game-card');
        if (!gameCard) return;

        e.preventDefault();
        const gameId = gameCard.dataset.gameId;
        gm.toggleFavorite(gameId);
        sfx.play('select');
        renderGameCards(gameSearch.value);
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

    // Screenshot High Score Function
    function generateHighScoreScreenshot() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#050512';
        ctx.fillRect(0, 0, 800, 600);
        
        // Title
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ Lightning Games', 400, 80);
        
        // High Scores
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('High Scores', 400, 140);
        
        const highScores = gm.highScores || {};
        const sortedScores = Object.entries(highScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        sortedScores.forEach((entry, i) => {
            const [gameId, score] = entry;
            const game = GAME_CARDS_CONFIG.find(g => g.id === gameId);
            const gameName = game ? game.name : gameId;
            
            ctx.fillStyle = '#00d4ff';
            ctx.fillText(`${i + 1}. ${gameName}`, 100, 200 + i * 35);
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(score.toString(), 700, 200 + i * 35);
            ctx.textAlign = 'left';
        });
        
        // Footer
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Generated by Lightning Games', 400, 570);
        
        // Convert to image and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lightning-games-highscores-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            sfx.play('achievement');
        });
    }
    
    // Share Achievements Function
    function shareAchievements() {
        const achievements = gm.achievements || [];
        const totalAchievements = ALL_ACHIEVEMENTS.length;
        const unlockedCount = achievements.length;
        
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#050512';
        ctx.fillRect(0, 0, 800, 600);
        
        // Title
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ Lightning Games', 400, 80);
        
        // Achievement Progress
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(`${unlockedCount} / ${totalAchievements}`, 400, 150);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#00ff88';
        ctx.fillText('Achievements Unlocked', 400, 180);
        
        // Progress Bar
        const barWidth = 600;
        const barHeight = 30;
        const barX = 100;
        const barY = 220;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const progress = unlockedCount / totalAchievements;
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // Recent Achievements
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Recent Achievements:', 100, 300);
        
        const recentAchievements = achievements.slice(-5).reverse();
        ctx.font = '16px Arial';
        recentAchievements.forEach((achId, i) => {
            const ach = ALL_ACHIEVEMENTS.find(a => a.id === achId);
            if (ach) {
                ctx.fillStyle = '#00d4ff';
                ctx.fillText(`${ach.icon} ${ach.title}`, 100, 340 + i * 30);
            }
        });
        
        // Footer
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Generated by Lightning Games', 400, 570);
        
        // Convert to image and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lightning-games-achievements-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            sfx.play('achievement');
        });
    }
    
    // Hard Reset Functionality
    const resetModal = document.getElementById('reset-modal');
    const btnHardReset = document.getElementById('btn-hard-reset');
    const resetStep1 = document.getElementById('reset-step-1');
    const resetStep2 = document.getElementById('reset-step-2');
    const resetStep3 = document.getElementById('reset-step-3');
    const resetActionsInitial = document.getElementById('reset-actions-initial');
    const resetConfirmArea = document.getElementById('reset-confirm-area');
    const resetConfirmInput = document.getElementById('reset-confirm-input');
    const resetCountdownArea = document.getElementById('reset-countdown-area');
    const resetCountdown = document.getElementById('reset-countdown');
    const btnCancelInitial = document.getElementById('reset-btn-cancel-initial');
    const btnContinue = document.getElementById('reset-btn-continue');
    const btnCancelConfirm = document.getElementById('reset-btn-cancel');
    
    let resetStep = 0;
    let resetInterval = null;
    
    if (btnHardReset && resetModal) {
        btnHardReset.addEventListener('click', () => {
            resetStep = 0;
            resetModal.classList.add('active');
            resetActionsInitial.style.display = 'flex';
            resetConfirmArea.style.display = 'none';
            resetCountdownArea.style.display = 'none';
            resetStep1.classList.remove('active');
            resetStep2.classList.remove('active');
            resetStep3.classList.remove('active');
            resetConfirmInput.value = '';
        });
        
        btnCancelInitial.addEventListener('click', () => {
            resetModal.classList.remove('active');
        });
        
        btnContinue.addEventListener('click', () => {
            resetStep = 1;
            resetActionsInitial.style.display = 'none';
            resetConfirmArea.style.display = 'flex';
            resetStep1.classList.add('active');
            resetStep2.classList.add('active');
            resetConfirmInput.focus();
        });
        
        btnCancelConfirm.addEventListener('click', () => {
            resetModal.classList.remove('active');
            resetStep = 0;
            if (resetInterval) clearInterval(resetInterval);
        });
        
        resetConfirmInput.addEventListener('input', () => {
            if (resetConfirmInput.value.toUpperCase() === 'RESET') {
                resetStep = 2;
                resetConfirmArea.style.display = 'none';
                resetCountdownArea.style.display = 'block';
                resetStep3.classList.add('active');
                
                let count = 5;
                resetCountdown.textContent = count;
                
                resetInterval = setInterval(() => {
                    count--;
                    if (count > 0) {
                        resetCountdown.textContent = count;
                    } else {
                        clearInterval(resetInterval);
                        performHardReset();
                    }
                }, 1000);
            }
        });
    }
    
    function performHardReset() {
        // Clear all localStorage
        localStorage.clear();
        
        // Reload page
        location.reload();
    }
    
    // Export Data Functionality
    const btnExportData = document.getElementById('btn-export-data');
    const dataExportModal = document.getElementById('data-export-modal');
    const dataExportInfo = document.getElementById('export-data-info');
    const btnDataExportCancel = document.getElementById('data-export-cancel');
    const btnDataExportDownload = document.getElementById('data-export-download');
    
    if (btnExportData && dataExportModal) {
        btnExportData.addEventListener('click', () => {
            // Gather ALL data - EVERYTHING
            const data = {
                version: '3.5',
                exportDate: new Date().toISOString(),
                
                // Game State
                highScores: gm.highScores || {},
                achievements: gm.achievements || [],
                settings: gm.settings || {},
                theme: gm.theme || 'default',
                volume: gm.volume || 0.7,
                
                // Statistics
                totalGamesPlayed: gm.totalGamesPlayed || 0,
                totalPlayTime: gm.totalPlayTime || 0,
                totalAsteroidsDestroyed: gm.totalAsteroidsDestroyed || 0,
                uniqueGamesPlayed: gm.uniqueGamesPlayed || [],
                consecutiveGames: gm.consecutiveGames || 0,
                lastGameId: gm.lastGameId || null,
                lastPlayed: gm.lastPlayed || {},
                
                // Favorites
                favorites: gm.favorites || [],
                
                // Settings
                reducedMotion: gm.settings?.reducedMotion || false,
                shakeIntensity: gm.settings?.shakeIntensity || 1,
                renderScale: gm.settings?.renderScale || 0.9,
                particleDensity: gm.settings?.particleDensity || 1,
                glowIntensity: gm.settings?.glowIntensity || 1,
                animationSpeed: gm.settings?.animationSpeed || 1,
                showFps: gm.settings?.showFps || false,
                screenFlash: gm.settings?.screenFlash || true,
                sfxVolume: gm.settings?.sfxVolume || 1,
                musicVolume: gm.settings?.musicVolume || 0.5,
                muteOnBlur: gm.settings?.muteOnBlur !== false,
                autoPause: gm.settings?.autoPause || false,
                confirmExit: gm.settings?.confirmExit || false,
                showTimer: gm.settings?.showTimer !== false,
                difficulty: gm.settings?.difficulty || 'normal',
                compactMode: gm.settings?.compactMode || false,
                showDescriptions: gm.settings?.showDescriptions !== false,
                achievementNotifications: gm.settings?.achievementNotifications !== false,
                cardSize: gm.settings?.cardSize || 1,
                gridLayout: gm.settings?.gridLayout || 'auto',
                darkMode: gm.settings?.darkMode || false,
                
                // Recently played
                recentlyPlayed: gm.recentlyPlayed || [],
                
                // Game states (for games that save state)
                gameStates: gm.gameStates || {}
            };
            
            // Display info
            const achievementCount = data.achievements.length;
            const highScoreCount = Object.keys(data.highScores).length;
            const favoriteCount = data.favorites.length;
            const gamesPlayed = data.totalGamesPlayed;
            const playTimeMin = Math.round(data.totalPlayTime / 60);
            
            dataExportInfo.innerHTML = `
                <div class="data-info-item">
                    <span class="data-info-label">High Scores</span>
                    <span class="data-info-value">${highScoreCount}</span>
                </div>
                <div class="data-info-item">
                    <span class="data-info-label">Achievements</span>
                    <span class="data-info-value">${achievementCount}</span>
                </div>
                <div class="data-info-item">
                    <span class="data-info-label">Favorites</span>
                    <span class="data-info-value">${favoriteCount}</span>
                </div>
                <div class="data-info-item">
                    <span class="data-info-label">Games Played</span>
                    <span class="data-info-value">${gamesPlayed}</span>
                </div>
                <div class="data-info-item">
                    <span class="data-info-label">Play Time</span>
                    <span class="data-info-value">${playTimeMin} min</span>
                </div>
                <div class="data-info-item">
                    <span class="data-info-label">Theme</span>
                    <span class="data-info-value">${data.theme}</span>
                </div>
                <div class="data-info-item">
                    <span class="data-info-label">Difficulty</span>
                    <span class="data-info-value">${data.difficulty}</span>
                </div>
            `;
            
            dataExportModal.classList.add('active');
            
            btnDataExportDownload.onclick = () => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `lightning-games-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                dataExportModal.classList.remove('active');
                sfx.play('achievement');
            };
        });
        
        btnDataExportCancel.addEventListener('click', () => {
            dataExportModal.classList.remove('active');
        });
    }
    
    // Import Data Functionality
    const btnImportData = document.getElementById('btn-import-data');
    const dataImportModal = document.getElementById('data-import-modal');
    const importFileInput = document.getElementById('import-file-input');
    const importDataPreview = document.getElementById('import-data-preview');
    const btnDataImportCancel = document.getElementById('data-import-cancel');
    const btnDataImportConfirm = document.getElementById('data-import-confirm');
    const importSuccessToast = document.getElementById('import-success-toast');
    
    let importData = null;
    
    if (btnImportData && dataImportModal) {
        btnImportData.addEventListener('click', () => {
            importFileInput.click();
        });
        
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    importData = JSON.parse(event.target.result);
                    
                    // Preview data
                    const achievementCount = importData.achievements?.length || 0;
                    const highScoreCount = importData.highScores ? Object.keys(importData.highScores).length : 0;
                    const favoriteCount = importData.favorites?.length || 0;
                    const gamesPlayed = importData.totalGamesPlayed || 0;
                    
                    importDataPreview.innerHTML = `
                        <div class="data-info-item">
                            <span class="data-info-label">High Scores</span>
                            <span class="data-info-value">${highScoreCount}</span>
                        </div>
                        <div class="data-info-item">
                            <span class="data-info-label">Achievements</span>
                            <span class="data-info-value">${achievementCount}</span>
                        </div>
                        <div class="data-info-item">
                            <span class="data-info-label">Favorites</span>
                            <span class="data-info-value">${favoriteCount}</span>
                        </div>
                        <div class="data-info-item">
                            <span class="data-info-label">Games Played</span>
                            <span class="data-info-value">${gamesPlayed}</span>
                        </div>
                        <div class="data-info-item">
                            <span class="data-info-label">Export Date</span>
                            <span class="data-info-value">${importData.exportDate ? new Date(importData.exportDate).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                    `;
                    
                    dataImportModal.classList.add('active');
                    btnDataImportConfirm.disabled = false;
                } catch (err) {
                    importDataPreview.innerHTML = `<p style="color: var(--accent-red);">Invalid file format</p>`;
                    btnDataImportConfirm.disabled = true;
                }
            };
            reader.readAsText(file);
        });
        
        btnDataImportCancel.addEventListener('click', () => {
            dataImportModal.classList.remove('active');
            importFileInput.value = '';
            importData = null;
        });
        
        btnDataImportConfirm.addEventListener('click', () => {
            if (!importData) return;
            
            // Restore ALL data - EVERYTHING
            if (importData.highScores) gm.highScores = importData.highScores;
            if (importData.achievements) gm.achievements = importData.achievements;
            if (importData.settings) gm.settings = importData.settings;
            if (importData.theme) gm.theme = importData.theme;
            if (importData.volume !== undefined) gm.volume = importData.volume;
            if (importData.totalGamesPlayed) gm.totalGamesPlayed = importData.totalGamesPlayed;
            if (importData.totalPlayTime) gm.totalPlayTime = importData.totalPlayTime;
            if (importData.totalAsteroidsDestroyed) gm.totalAsteroidsDestroyed = importData.totalAsteroidsDestroyed;
            if (importData.uniqueGamesPlayed) gm.uniqueGamesPlayed = importData.uniqueGamesPlayed;
            if (importData.consecutiveGames) gm.consecutiveGames = importData.consecutiveGames;
            if (importData.lastGameId) gm.lastGameId = importData.lastGameId;
            if (importData.lastPlayed) gm.lastPlayed = importData.lastPlayed;
            if (importData.favorites) gm.favorites = importData.favorites;
            if (importData.recentlyPlayed) gm.recentlyPlayed = importData.recentlyPlayed;
            if (importData.gameStates) gm.gameStates = importData.gameStates;
            
            // Restore all settings
            if (importData.reducedMotion !== undefined) gm.settings.reducedMotion = importData.reducedMotion;
            if (importData.shakeIntensity !== undefined) gm.settings.shakeIntensity = importData.shakeIntensity;
            if (importData.renderScale !== undefined) gm.settings.renderScale = importData.renderScale;
            if (importData.particleDensity !== undefined) gm.settings.particleDensity = importData.particleDensity;
            if (importData.glowIntensity !== undefined) gm.settings.glowIntensity = importData.glowIntensity;
            if (importData.animationSpeed !== undefined) gm.settings.animationSpeed = importData.animationSpeed;
            if (importData.showFps !== undefined) gm.settings.showFps = importData.showFps;
            if (importData.screenFlash !== undefined) gm.settings.screenFlash = importData.screenFlash;
            if (importData.sfxVolume !== undefined) gm.settings.sfxVolume = importData.sfxVolume;
            if (importData.musicVolume !== undefined) gm.settings.musicVolume = importData.musicVolume;
            if (importData.muteOnBlur !== undefined) gm.settings.muteOnBlur = importData.muteOnBlur;
            if (importData.autoPause !== undefined) gm.settings.autoPause = importData.autoPause;
            if (importData.confirmExit !== undefined) gm.settings.confirmExit = importData.confirmExit;
            if (importData.showTimer !== undefined) gm.settings.showTimer = importData.showTimer;
            if (importData.difficulty !== undefined) gm.settings.difficulty = importData.difficulty;
            if (importData.compactMode !== undefined) gm.settings.compactMode = importData.compactMode;
            if (importData.showDescriptions !== undefined) gm.settings.showDescriptions = importData.showDescriptions;
            if (importData.achievementNotifications !== undefined) gm.settings.achievementNotifications = importData.achievementNotifications;
            if (importData.cardSize !== undefined) gm.settings.cardSize = importData.cardSize;
            if (importData.gridLayout !== undefined) gm.settings.gridLayout = importData.gridLayout;
            if (importData.darkMode !== undefined) gm.settings.darkMode = importData.darkMode;
            
            // Save to localStorage
            gm.saveProgress();
            
            // Apply theme
            document.documentElement.setAttribute('data-theme', gm.theme);
            
            // Apply dark mode
            if (importData.darkMode !== undefined) {
                document.documentElement.setAttribute('data-dark-mode', importData.darkMode);
            }
            
            // Close modal and show success
            dataImportModal.classList.remove('active');
            importFileInput.value = '';
            importData = null;
            
            // Show success toast
            importSuccessToast.classList.add('show');
            setTimeout(() => {
                importSuccessToast.classList.remove('show');
            }, 3000);
            
            // Refresh UI
            renderGameCards(gameSearch.value);
            renderStats();
            updateFooterStats();
            
            sfx.play('achievement');
        });
    }

})();
