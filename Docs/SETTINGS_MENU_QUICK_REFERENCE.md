# Settings Menu v2.0 - Quick Reference

## 🎯 What's New

### Tab-Based Organization
Settings are now organized into **5 main tabs** for better navigation:

| Tab | Icon | Contents |
|-----|------|----------|
| **Display** | 🎨 | Themes, visual effects, resolution |
| **Audio** | 🔊 | Volume controls, sound settings |
| **Gameplay** | 🎮 | Difficulty, pause, timer options |
| **Interface** | 📱 | Layout, card size, grid columns |
| **Data** | 💾 | Export, import, hard reset, help |

---

## 📊 Complete Settings List

### Display Tab (🎨)
- **Themes** (11 options)
  - Neon, Retro, Minimal, Forest, Ocean
  - Sunset, Purple, Matrix, Cyberpunk, Dark Blue, Fire
- **Visual Effects**
  - Screen shake intensity (0-100%)
  - Resolution scale (70-100%)
  - Particle density (0-100%)
  - Glow intensity (0-100%)
  - Animation speed (50-200%)
- **Toggles**
  - Reduce motion
  - Show FPS counter
  - Screen flash effects

### Audio Tab (🔊)
- **Volume Sliders**
  - Sound effects (0-100%)
  - Music (0-100%)
- **Toggles**
  - Mute when window loses focus
  - Background music
  - Sound effects

### Gameplay Tab (🎮)
- **Toggles**
  - Auto-pause on blur
  - Confirm before exit
  - Show game timer
- **Difficulty**
  - Easy, Normal, Hard, Extreme

### Interface Tab (📱)
- **Layout Options**
  - Compact card view
  - Show descriptions
  - Achievement notifications
  - Card size (80-120%)
  - Grid layout (2-6 columns)
  - Dark mode override

### Data Tab (💾)
- **Data Management**
  - Export all data (JSON)
  - Import data (from file)
- **Help**
  - Start tutorial
  - Screenshot high score
  - Share achievements
- **Danger Zone**
  - Hard reset (delete all)

---

## 🎨 Visual Enhancements

### Improved Components
- **Sliders**: Gradient thumbs with glow effects
- **Buttons**: Gradient backgrounds, smooth hover animations
- **Checkboxes**: Cyan accent, smooth transitions
- **Selects**: Glass morphism styling
- **Tabs**: Active state with glow effect

### Animations
- Tab switching: 200ms fade-in
- Slider hover: Scale effect
- Button hover: 2px lift with glow
- Modal open: Slide-up animation

---

## 💾 Data Management Features

### Export Data
```
Click "Export All Data"
↓
JSON file downloads automatically
↓
File includes: scores, achievements, settings, stats
↓
Filename: lightning-games-backup-{timestamp}.json
```

### Import Data
```
Click "Import Data"
↓
Select previously exported JSON file
↓
Preview data before import
↓
Click "Import" to confirm
↓
Success notification
↓
Page reloads with new data
```

### Hard Reset
```
Click "Hard Reset"
↓
Confirm deletion (2 confirmations)
↓
All data deleted permanently
↓
Page reloads with defaults
```

---

## 🎮 Difficulty Levels

| Level | Description | Best For |
|-------|-------------|----------|
| **Easy** | Reduced enemy speed, more health | Learning |
| **Normal** | Balanced difficulty | Most players |
| **Hard** | Increased challenge | Experienced |
| **Extreme** | Maximum difficulty | Hardcore |

---

## 🎨 Theme Previews

### Neon (Default)
- Background: Dark purple (#050512)
- Primary: Cyan (#00d4ff)
- Modern, vibrant

### Retro
- Background: Dark yellow (#1a1a00)
- Primary: Amber (#ffaa00)
- Vintage arcade feel

### Minimal
- Background: Pure black (#000000)
- Primary: White (#ffffff)
- Clean, simple

### Forest
- Background: Dark green (#001a0a)
- Primary: Bright green (#00ff88)
- Nature-inspired

### Ocean
- Background: Dark blue (#001a2e)
- Primary: Cyan (#00d4ff)
- Water theme

### Sunset
- Background: Dark orange (#2e1a00)
- Primary: Orange (#ff6b35)
- Warm tones

### Purple
- Background: Dark purple (#1a001a)
- Primary: Purple (#b537f2)
- Vibrant

### Matrix
- Background: Pure black (#000000)
- Primary: Green (#00ff00)
- Hacker aesthetic

### Cyberpunk
- Background: Very dark (#0a0a0a)
- Primary: Magenta (#ff00ff)
- Futuristic

### Dark Blue
- Background: Dark blue (#0a0a1e)
- Primary: Blue (#4d94ff)
- Cool tones

### Fire
- Background: Dark red (#1a0000)
- Primary: Red (#ff4500)
- Hot theme

---

## 📱 Responsive Behavior

### Desktop (1200px+)
- Full-width panel
- 5-column theme grid
- All tabs visible
- Optimal spacing

### Tablet (768px-1199px)
- Adjusted width
- 4-column theme grid
- Scrollable tabs
- Compact spacing

### Mobile (480px-767px)
- Full-width (with margins)
- 3-column theme grid
- Horizontal tab scroll
- Minimal padding

### Small Mobile (<480px)
- Maximum optimization
- 3-column theme grid
- Stacked buttons
- Minimal spacing

---

## 🔧 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Settings | Click ⚙️ button |
| Close Settings | Click ✕ or Escape |
| Switch Tab | Click tab button |
| Adjust Slider | Arrow keys (when focused) |
| Toggle Checkbox | Space (when focused) |

---

## 💡 Tips & Tricks

### Performance Optimization
- Lower resolution scale (70%) for better FPS
- Reduce particle density for smoother gameplay
- Disable animations for minimal motion

### Audio Setup
- Set SFX to 100% for full sound effects
- Set music to 50% for background ambiance
- Enable "Mute on Blur" to save battery

### Gameplay Preferences
- Enable "Auto-Pause" to pause when window loses focus
- Enable "Confirm Exit" to prevent accidental exits
- Set difficulty to "Hard" for more challenge

### Interface Customization
- Enable "Compact Mode" for more games on screen
- Increase "Card Size" to 120% for easier clicking
- Set "Grid Layout" to 6 columns for overview

### Data Backup
- Export data regularly (weekly recommended)
- Store backups in safe location
- Test import before deleting data

---

## 🐛 Troubleshooting

### Settings Not Saving
- Check if localStorage is enabled
- Try clearing browser cache
- Restart the application

### Theme Not Applying
- Reload the page
- Clear browser cache
- Try different theme

### Data Import Fails
- Verify JSON file is valid
- Check file is from Lightning Games
- Try re-exporting data

### Export File Not Downloading
- Check browser download settings
- Disable popup blocker
- Try different browser

---

## 📊 Settings Storage

### Where Settings Are Stored
- **Browser**: localStorage
- **Key Prefix**: `lg_`
- **Size**: ~50-100KB
- **Backup**: Export as JSON

### What Gets Saved
- High scores (all games)
- Achievements (unlocked)
- Settings (all preferences)
- Favorites (pinned games)
- Theme selection
- Volume level
- Play statistics

### Data Persistence
- Settings saved automatically
- Persists across sessions
- Survives browser restart
- Lost if cache is cleared

---

## 🔐 Privacy & Security

### Data Storage
- 100% local (no cloud)
- No external connections
- No telemetry
- No tracking

### Data Export
- JSON format (readable)
- No encryption
- Can be edited manually
- Timestamp included

### Data Import
- Validates format
- Checks structure
- Overwrites current data
- No external validation

### Hard Reset
- Permanent deletion
- Cannot be undone
- Double confirmation
- No recovery

---

## 🚀 Future Enhancements

### Planned
- Settings profiles (multiple saves)
- Keyboard shortcuts customization
- Accessibility options
- Performance profiling

### Possible
- Cloud backup
- Settings search
- Settings history
- Settings comparison

---

**Version:** 2.0  
**Last Updated:** 2026-03-11  
**Status:** Production Ready

*Enhanced Settings Menu - Complete, Professional, User-Friendly*
