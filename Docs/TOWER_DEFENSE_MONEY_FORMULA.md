# Tower Defense - Dynamic Starting Money Formula

## Overview

Tower Defense now uses a dynamic formula to calculate starting money based on difficulty level:

```
Starting Money = Base Money (150) × Difficulty Multiplier
```

This ensures that starting money scales proportionally with difficulty, making the game more balanced across all difficulty levels.

## Formula Details

### Base Money
- **Base Money**: 150 (constant)
- **Formula**: `startMoney = Math.floor(150 × difficultyMultiplier)`

### Difficulty Multipliers

| Difficulty | Multiplier | Starting Money | Calculation |
|------------|-----------|-----------------|-------------|
| **Easy** | 1.5 | 225 | 150 × 1.5 = 225 |
| **Normal** | 1.0 | 150 | 150 × 1.0 = 150 |
| **Hard** | 0.8 | 120 | 150 × 0.8 = 120 |
| **Extreme** | 0.5 | 75 | 150 × 0.5 = 75 |
| **Nightmare** | 0.6 | 90 | 150 × 0.6 = 90 |

## Implementation

### difficultySettings Structure
```javascript
difficultySettings = {
    easy: {
        difficultyMultiplier: 1.5,
        startMoney: Math.floor(150 * 1.5),  // 225
        // ... other settings
    },
    normal: {
        difficultyMultiplier: 1.0,
        startMoney: Math.floor(150 * 1.0),  // 150
        // ... other settings
    },
    hard: {
        difficultyMultiplier: 0.8,
        startMoney: Math.floor(150 * 0.8),  // 120
        // ... other settings
    },
    extreme: {
        difficultyMultiplier: 0.5,
        startMoney: Math.floor(150 * 0.5),  // 75
        // ... other settings
    },
    nightmare: {
        difficultyMultiplier: 0.6,
        startMoney: Math.floor(150 * 0.6),  // 90
        // ... other settings
    }
}
```

### Application in init()
```javascript
const settings = this.difficultySettings[this.difficulty];
this.money = settings.startMoney;  // Uses calculated value
```

## Difficulty Progression

### Easy Mode
- **Multiplier**: 1.5 (50% more money)
- **Starting Money**: 225
- **Purpose**: Beginner-friendly, more resources
- **Strategy**: Build more towers, experiment with strategies

### Normal Mode
- **Multiplier**: 1.0 (baseline)
- **Starting Money**: 150
- **Purpose**: Balanced challenge
- **Strategy**: Careful tower placement and upgrades

### Hard Mode
- **Multiplier**: 0.8 (20% less money)
- **Starting Money**: 120
- **Purpose**: Challenging, requires optimization
- **Strategy**: Efficient tower placement, strategic upgrades

### Extreme Mode
- **Multiplier**: 0.5 (50% less money)
- **Starting Money**: 75
- **Purpose**: Ultimate challenge, minimal resources
- **Strategy**: Perfect tower placement, no room for error

### Nightmare Mode
- **Multiplier**: 0.6 (40% less money)
- **Starting Money**: 90
- **Purpose**: Very challenging
- **Strategy**: Highly optimized tower placement

## Game Balance

### Money vs Difficulty
- **Easy**: More money (225) + Weaker enemies (0.75x HP)
- **Normal**: Baseline money (150) + Baseline enemies (1.34x HP)
- **Hard**: Less money (120) + Stronger enemies (2.144x HP)
- **Extreme**: Much less money (75) + Much stronger enemies (3.2x HP)

### Resource Scarcity
- **Easy**: Abundant resources, forgiving gameplay
- **Normal**: Balanced resources, moderate challenge
- **Hard**: Limited resources, requires optimization
- **Extreme**: Scarce resources, extreme challenge

## UI Display

### Difficulty Selection Screen
The difficulty selection screen now displays starting money for each difficulty:

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐
│  Easy    │ │ Normal   │ │  Hard    │ │Extreme │
│ 0.75x HP │ │ 1.34x HP │ │ 2.14x HP │ │ 3.2x HP│
│  $225    │ │  $150    │ │  $120    │ │  $75   │
└──────────┘ └──────────┘ └──────────┘ └────────┘
```

## Testing

### Test Cases
1. **Easy Mode**
   - Select Easy difficulty
   - Verify starting money is 225
   - Verify enemies are weaker (0.75x HP)

2. **Normal Mode**
   - Select Normal difficulty
   - Verify starting money is 150
   - Verify enemies are baseline (1.34x HP)

3. **Hard Mode**
   - Select Hard difficulty
   - Verify starting money is 120
   - Verify enemies are stronger (2.144x HP)

4. **Extreme Mode**
   - Select Extreme difficulty
   - Verify starting money is 75
   - Verify enemies are much stronger (3.2x HP)

5. **Formula Verification**
   - Verify: Easy money (225) = 150 × 1.5 ✓
   - Verify: Normal money (150) = 150 × 1.0 ✓
   - Verify: Hard money (120) = 150 × 0.8 ✓
   - Verify: Extreme money (75) = 150 × 0.5 ✓

## Benefits

1. **Consistent Scaling**: Money scales proportionally with difficulty
2. **Balanced Gameplay**: Each difficulty has appropriate resources
3. **Clear Progression**: Easy → Normal → Hard → Extreme
4. **Predictable**: Formula is simple and easy to understand
5. **Flexible**: Easy to adjust multipliers for balance changes

## Future Adjustments

If balance changes are needed, only the multiplier values need to be adjusted:

```javascript
// Example: Make Hard mode slightly easier
hard: {
    difficultyMultiplier: 0.85,  // Changed from 0.8
    startMoney: Math.floor(150 * 0.85),  // 127.5 → 127
    // ...
}
```

## Files Modified

- `games/towerdefense.js`
  - Added `difficultyMultiplier` to each difficulty setting
  - Updated `startMoney` calculations to use formula
  - Updated difficulty selection screen descriptions

## Status

✅ **Complete** - Dynamic starting money formula is fully implemented and working.

Starting money now scales proportionally with difficulty, ensuring balanced gameplay across all difficulty levels.

---

**Version**: 3.4  
**Date**: March 9, 2026  
**Formula**: `startMoney = Math.floor(150 × difficultyMultiplier)`
