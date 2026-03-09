# Tower Defense - Starting Money Formula Update

## Summary

Tower Defense starting money now uses a dynamic formula based on difficulty level:

```
Starting Money = Base Money (150) × Difficulty Multiplier
```

## Changes

### Before
- Easy: 250 (hardcoded)
- Normal: 200 (hardcoded)
- Hard: 120 (hardcoded)
- Extreme: 80 (hardcoded)

### After
- Easy: 225 (150 × 1.5)
- Normal: 150 (150 × 1.0)
- Hard: 120 (150 × 0.8)
- Extreme: 75 (150 × 0.5)
- Nightmare: 90 (150 × 0.6)

## Benefits

1. **Consistent Formula**: All difficulties use the same base (150) and multiplier
2. **Scalable**: Easy to adjust all difficulties by changing base or multipliers
3. **Balanced**: Money scales proportionally with difficulty
4. **Predictable**: Formula is simple and transparent
5. **Flexible**: Can easily add new difficulties

## Implementation

### difficultySettings Update
Each difficulty now includes:
```javascript
difficultyMultiplier: <value>,
startMoney: Math.floor(150 * <value>)
```

### Example
```javascript
hard: {
    difficultyMultiplier: 0.8,
    startMoney: Math.floor(150 * 0.8),  // 120
    // ... other settings
}
```

## Difficulty Multipliers

| Difficulty | Multiplier | Money | Meaning |
|------------|-----------|-------|---------|
| Easy | 1.5 | 225 | 50% more money |
| Normal | 1.0 | 150 | Baseline |
| Hard | 0.8 | 120 | 20% less money |
| Extreme | 0.5 | 75 | 50% less money |
| Nightmare | 0.6 | 90 | 40% less money |

## UI Updates

Difficulty selection screen now shows starting money:
- Easy: "0.75x HP, 0.9x Speed, $225"
- Normal: "1.34x HP, 1.15x Speed, $150"
- Hard: "2.144x HP, 1.84x Speed, $120"
- Extreme: "3.2x HP, 2.4x Speed, $75"

## Testing

✅ All difficulties tested:
- Easy: 225 money ✓
- Normal: 150 money ✓
- Hard: 120 money ✓
- Extreme: 75 money ✓
- Nightmare: 90 money ✓

✅ Formula verification:
- 150 × 1.5 = 225 ✓
- 150 × 1.0 = 150 ✓
- 150 × 0.8 = 120 ✓
- 150 × 0.5 = 75 ✓
- 150 × 0.6 = 90 ✓

## Files Modified

- `games/towerdefense.js`
  - Updated `difficultySettings` with multipliers
  - Updated `startMoney` calculations
  - Updated difficulty selection screen descriptions

## Status

✅ **Complete** - Dynamic starting money formula is fully implemented.

---

**Version**: 3.4  
**Date**: March 9, 2026
