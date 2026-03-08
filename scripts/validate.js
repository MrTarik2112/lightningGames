#!/usr/bin/env node
/**
 * Validate Script - Validate game files and check for common issues
 * Usage: node scripts/validate.js [game-id]
 */

const fs = require('fs');
const path = require('path');

const neon = {
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;226m',
  red: '\x1b[38;5;196m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const projectRoot = path.join(__dirname, '..');
const gamesDir = path.join(projectRoot, 'games');

const REQUIRED_METHODS = ['init', 'update', 'draw', 'getScore', 'isGameOver', 'destroy'];

function validateGameFile(filePath) {
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Check for class definition
  if (!content.includes('class ')) {
    issues.push({ type: 'error', msg: 'No class definition found' });
  }
  
  // Check for required methods
  for (const method of REQUIRED_METHODS) {
    const methodPattern = new RegExp(`(async\\s+)?${method}\\s*\\(`);
    if (!methodPattern.test(content)) {
      issues.push({ type: 'error', msg: `Missing method: ${method}()` });
    }
  }
  
  // Check for common issues
  if (content.includes('document.write')) {
    issues.push({ type: 'warning', msg: 'Uses document.write() - not recommended' });
  }
  
  if (content.includes('eval(')) {
    issues.push({ type: 'warning', msg: 'Uses eval() - security risk' });
  }
  
  // Check for proper canvas usage
  if (!content.includes('ctx.') && !content.includes('context.')) {
    issues.push({ type: 'info', msg: 'No direct canvas context usage detected' });
  }
  
  // Check for game over handling
  if (!content.includes('gameOver') && !content.includes('isGameOver')) {
    issues.push({ type: 'warning', msg: 'May not handle game over state' });
  }
  
  // Check for score tracking
  if (!content.includes('score') && !content.includes('getScore')) {
    issues.push({ type: 'warning', msg: 'May not track score' });
  }
  
  // Line count
  const lines = content.split('\n').length;
  
  return { fileName, issues, lines };
}

function validateAllGames() {
  const gameFiles = fs.readdirSync(gamesDir).filter(f => f.endsWith('.js'));
  const results = [];
  
  for (const file of gameFiles) {
    const filePath = path.join(gamesDir, file);
    const result = validateGameFile(filePath);
    results.push(result);
  }
  
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const targetGame = args[0];
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}🔍 Lightning Games Validator${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  
  if (targetGame) {
    // Validate specific game
    const filePath = path.join(gamesDir, `${targetGame}.js`);
    if (!fs.existsSync(filePath)) {
      console.log(`${neon.red}✗ Game not found: ${targetGame}${neon.reset}`);
      process.exit(1);
    }
    
    const result = validateGameFile(filePath);
    console.log(`${neon.bold}${result.fileName}${neon.reset} (${result.lines} lines)`);
    console.log();
    
    for (const issue of result.issues) {
      const icon = issue.type === 'error' ? '✗' : issue.type === 'warning' ? '⚠' : 'ℹ';
      const color = issue.type === 'error' ? neon.red : issue.type === 'warning' ? neon.yellow : neon.dim;
      console.log(`  ${color}${icon}${neon.reset} ${issue.msg}`);
    }
    
    if (result.issues.length === 0) {
      console.log(`  ${neon.green}✓ No issues found${neon.reset}`);
    }
  } else {
    // Validate all games
    const results = validateAllGames();
    
    let totalIssues = 0;
    let totalLines = 0;
    
    for (const result of results) {
      const hasErrors = result.issues.some(i => i.type === 'error');
      const hasWarnings = result.issues.some(i => i.type === 'warning');
      
      const statusIcon = hasErrors ? `${neon.red}✗` : hasWarnings ? `${neon.yellow}⚠` : `${neon.green}✓`;
      const issueCount = result.issues.length;
      
      console.log(`  ${statusIcon}${neon.reset} ${result.fileName.padEnd(20)} ${neon.dim}${result.lines} lines${neon.reset} ${issueCount > 0 ? neon.dim + `(${issueCount} issues)` : ''}${neon.reset}`);
      
      totalIssues += issueCount;
      totalLines += result.lines;
    }
    
    console.log();
    console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
    console.log(`  ${results.length} games, ${totalLines.toLocaleString()} total lines`);
    
    if (totalIssues === 0) {
      console.log(`  ${neon.green}✓ All games valid!${neon.reset}`);
    } else {
      console.log(`  ${neon.yellow}⚠ ${totalIssues} issues found${neon.reset}`);
    }
  }
  
  console.log();
}

main().catch(console.error);
