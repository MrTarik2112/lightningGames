const fs = require('fs');

let css = fs.readFileSync('styles/main.css', 'utf8');

// List of all title classes that need Orbitron font
const titleClasses = [
  '.launcher-title',
  '.section-title',
  '.stats-section-title',
  '.settings-section-title',
  '.milestone-title',
  '.game-title-bar',
  '.settings-title',
  '.tutorial-title',
  '.quick-summary-title',
  '.summary-header',
  '.recent-name',
  '.no-results-text'
];

// Add font-family to each title class
titleClasses.forEach(cls => {
  const oldPattern = `${cls} \\{[^}]*?font-size:`;
  const newText = `${cls} {\n  font-family: 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, sans-serif;\n  font-size:`;
  css = css.replace(new RegExp(oldPattern, 'g'), newText);
});

// Also update game-card-name if not already updated
const gameCardNamePattern = '\\.game-card-name \\{[^}]*?font-size:';
const gameCardNameReplace = '.game-card-name {\n  font-family: \'Orbitron\', \'Rajdhani\', -apple-system, BlinkMacSystemFont, sans-serif;\n  font-size:';
css = css.replace(new RegExp(gameCardNamePattern, 'g'), gameCardNameReplace);

// Update achievement-title
const achievementTitlePattern = '\\.achievement-title \\{[^}]*?font-size:';
const achievementTitleReplace = '.achievement-title {\n  font-family: \'Orbitron\', \'Rajdhani\', -apple-system, BlinkMacSystemFont, sans-serif;\n  font-size:';
css = css.replace(new RegExp(achievementTitlePattern, 'g'), achievementTitleReplace);

// Update stat-label
const statLabelPattern = '\\.stat-label \\{[^}]*?font-size:';
const statLabelReplace = '.stat-label {\n  font-family: \'Orbitron\', \'Rajdhani\', -apple-system, BlinkMacSystemFont, sans-serif;\n  font-size:';
css = css.replace(new RegExp(statLabelPattern, 'g'), statLabelReplace);

// Update title-text
const titleTextPattern = '\\.title-text \\{[^}]*?font-size:';
const titleTextReplace = '.title-text {\n  font-family: \'Orbitron\', \'Rajdhani\', -apple-system, BlinkMacSystemFont, sans-serif;\n  font-size:';
css = css.replace(new RegExp(titleTextPattern, 'g'), titleTextReplace);

// Update achievement-toast-title
const toastTitlePattern = '\\.achievement-toast-title \\{[^}]*?font-size:';
const toastTitleReplace = '.achievement-toast-title {\n  font-family: \'Orbitron\', \'Rajdhani\', -apple-system, BlinkMacSystemFont, sans-serif;\n  font-size:';
css = css.replace(new RegExp(toastTitlePattern, 'g'), toastTitleReplace);

fs.writeFileSync('styles/main.css', css);
console.log('All fonts updated successfully with Orbitron and Rajdhani!');