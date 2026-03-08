#!/usr/bin/env node
/**
 * Lint Script - Check code style and formatting
 * Usage: node scripts/lint.js [--fix]
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

const LINT_RULES = [
  {
    name: 'No console.log in production',
    pattern: /console\.log\(/g,
    severity: 'warning',
    exclude: ['scripts/', 'main.js'],
  },
  {
    name: 'No var keyword',
    pattern: /\bvar\s+/g,
    severity: 'error',
  },
  {
    name: 'No == (use ===)',
    pattern: /[^=!]==[^=]/g,
    severity: 'warning',
  },
  {
    name: 'No debugger statements',
    pattern: /\bdebugger\b/g,
    severity: 'error',
  },
  {
    name: 'No alert()',
    pattern: /\balert\(/g,
    severity: 'warning',
  },
  {
    name: 'Semicolons required',
    pattern: /[^;\s{}]\s*\n\s*[a-zA-Z]/g,
    severity: 'info',
  },
  {
    name: 'Line length > 100',
    check: (line) => line.length > 100,
    severity: 'info',
  },
  {
    name: 'Trailing whitespace',
    pattern: /\s+$/g,
    severity: 'info',
  },
];

function lintFile(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  const relativePath = path.relative(projectRoot, filePath);
  
  // Skip excluded files
  for (const rule of LINT_RULES) {
    if (rule.exclude && rule.exclude.some(e => relativePath.startsWith(e))) {
      continue;
    }
    
    if (rule.pattern) {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      while ((match = regex.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          rule: rule.name,
          severity: rule.severity,
          line: lineNum,
          msg: `Found: "${match[0].substring(0, 20)}"`,
        });
      }
    }
    
    if (rule.check) {
      lines.forEach((line, idx) => {
        if (rule.check(line)) {
          issues.push({
            rule: rule.name,
            severity: rule.severity,
            line: idx + 1,
            msg: `Line length: ${line.length}`,
          });
        }
      });
    }
  }
  
  return { filePath: relativePath, issues };
}

function walkDir(dir, exts = ['.js']) {
  const files = [];
  
  const walk = (currentDir) => {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (exts.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch {}
  };
  
  walk(dir);
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  
  console.log();
  console.log(`${neon.cyan}${neon.bold}📝 Lightning Games Linter${neon.reset}`);
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log();
  
  const jsFiles = walkDir(projectRoot);
  
  let totalIssues = 0;
  let errors = 0;
  let warnings = 0;
  
  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = lintFile(filePath, content);
    
    if (result.issues.length > 0) {
      console.log(`${neon.bold}${result.filePath}${neon.reset}`);
      
      for (const issue of result.issues) {
        const icon = issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ';
        const color = issue.severity === 'error' ? neon.red : issue.severity === 'warning' ? neon.yellow : neon.dim;
        console.log(`  ${color}${icon}${neon.reset} Line ${issue.line}: ${issue.rule} - ${issue.msg}`);
        
        totalIssues++;
        if (issue.severity === 'error') errors++;
        if (issue.severity === 'warning') warnings++;
      }
      console.log();
    }
  }
  
  console.log(`${neon.dim}${'─'.repeat(50)}${neon.reset}`);
  console.log(`  ${jsFiles.length} files checked`);
  
  if (totalIssues === 0) {
    console.log(`${neon.green}✓ No issues found!${neon.reset}`);
  } else {
    console.log(`  ${neon.red}${errors} errors${neon.reset}, ${neon.yellow}${warnings} warnings${neon.reset}, ${totalIssues} total`);
  }
  
  console.log();
  
  process.exit(errors > 0 ? 1 : 0);
}

main().catch(console.error);
