# Tower Defense - In-Game Difficulty Selection Screen

## Overview

Tower Defense now has a built-in difficulty selection screen that appears when the game starts. Players must select a difficulty level before the game begins.

## Features

### Difficulty Selection Screen
- **Visual Design**: Dark overlay with neon-styled buttons
- **4 Difficulty Levels**: Easy, Normal, Hard, Extreme
- **Interactive Buttons**: Hover effects and glow animations
- **Start Button**: Disabled until a difficulty is selected
- **Instructions**: Clear on-screen guidance

### Difficulty Levels

| Level | Enemy HP | Enemy Speed | Starting Money | Starting Lives | Description |
|-------|----------|-------------|-----------------|-----------------|-------------|
| **Easy** | 0.75x | 0.9x | 250 | 30 | Perfect for beginners |
| **Normal** | 1.34x | 1.15x | 200 | 20 | Balanced challenge |
| **Hard** | 2.144x | 1.84x | 120 | 12 | 60% harder than normal |
| **Extreme** | 3.2x | 2.4x | 80 | 8 | Ultimate challenge |

## How It Works

### Game Flow
1. **Player starts Tower Defense**
2. **Difficulty selection screen appears**
3. **Player clicks a difficulty button** (button highlights)
4. **Player clicks START GAME button**
5. **Game begins with selected difficulty**

### Visual Feedback
- **Unselected buttons**: Subtle white border, semi-transparent
- **Hovered buttons**: Bright neon color, glowing effect
- **Selected button**: Bright neon color, thick border, strong glow
- **Start button**: Disabled (gray) until difficulty selected, enabled (cyan) when ready

### User Interaction
- **Click difficulty button**: Selects that difficulty
- **Click START GAME**: Starts the game with selected difficulty
- **Hover effects**: Visual feedback for interactive elements

## Implementation Details

### New State Variables
```javascript
this.showDifficultyScreen = true;      // Show difficulty screen on init
this.selectedDifficultyOption = null;  // Currently selected difficulty
```

### New Methods
- `_drawDifficultyScreen(ctx, canvas)` - Renders the difficulty selection UI
- `_handleDifficultyScreenClick(e)` - Handles clicks on difficulty buttons
- `_isPointInRect(px, py, rx, ry, rw, rh)` - Helper for click detection

### Modified Methods
- `init()` - Sets `showDifficultyScreen = true` to show screen on start
- `update()` - Skips game logic while difficulty screen is showing
- `draw()` - Draws difficulty screen if `showDifficultyScreen` is true
- `_handleClick()` - Routes clicks to difficulty screen handler if showing
- `_handleMouseMove()` - Updates hover state for UI elements

## Visual Design

### Colors
- **Easy**: Green (#00ff88)
- **Normal**: Cyan (#00d4ff)
- **Hard**: Magenta (#ff00aa)
- **Extreme**: Red (#ff4466)

### Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           SELECT DIFFICULTY                        │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Easy    │ │ Normal   │ │  Hard    │ │Extreme │ │
│  │ 0.75x HP │ │ 1.34x HP │ │ 2.14x HP │ │ 3.2x HP│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│              ┌──────────────────┐                   │
│              │   START GAME     │                   │
│              └──────────────────┘                   │
│                                                     │
│  Click a difficulty level, then click START GAME   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Testing

### Test Cases
1. **Screen appears on start**
   - Start Tower Defense
   - Verify difficulty selection screen appears
   - Verify game is paused (no enemies spawning)

2. **Button selection**
   - Click each difficulty button
   - Verify button highlights with correct color
   - Verify only one button can be selected at a time

3. **Start button behavior**
   - Verify START GAME button is disabled (gray) initially
   - Select a difficulty
   - Verify START GAME button becomes enabled (cyan)
   - Click START GAME
   - Verify game starts with correct difficulty

4. **Difficulty application**
   - Select "Hard" difficulty
   - Click START GAME
   - Verify starting money is 120 (not 200)
   - Verify starting lives are 12 (not 20)
   - Verify enemies are noticeably harder

5. **Hover effects**
   - Hover over difficulty buttons
   - Verify buttons glow with neon color
   - Hover over START GAME button
   - Verify button glows when difficulty is selected

## Code Structure

### Difficulty Screen Drawing
```javascript
_drawDifficultyScreen(ctx, canvas) {
    // Draw dark overlay
    // Draw title
    // Draw difficulty buttons with hover/selection effects
    // Draw START GAME button
    // Draw instructions
}
```

### Click Handling
```javascript
_handleDifficultyScreenClick(e) {
    // Get mouse position
    // Check if clicked on difficulty button
    // Check if clicked on START GAME button
    // Update game state accordingly
}
```

## Future Enhancements

- [ ] Add difficulty descriptions (tooltips)
- [ ] Add keyboard shortcuts (1-4 for difficulties, Enter to start)
- [ ] Add difficulty presets (custom difficulty settings)
- [ ] Add difficulty statistics (average score, win rate)
- [ ] Add difficulty achievements (beat hard mode, etc.)
- [ ] Add difficulty leaderboards

## Files Modified

- `games/towerdefense.js`
  - Added `showDifficultyScreen` and `selectedDifficultyOption` state
  - Modified `init()` to show difficulty screen
  - Modified `update()` to skip logic while screen showing
  - Modified `draw()` to render difficulty screen
  - Modified `_handleClick()` to handle difficulty screen clicks
  - Modified `_handleMouseMove()` to update hover state
  - Added `_drawDifficultyScreen()` method
  - Added `_handleDifficultyScreenClick()` method
  - Added `_isPointInRect()` helper method

## Status

✅ **Complete** - Difficulty selection screen is fully implemented and working.

Players can now select their preferred difficulty level before starting Tower Defense, ensuring the game is properly configured for their skill level.
