const { spawn } = require('child_process');

const proc = spawn('node', ['scripts/build.js'], {
  stdio: 'pipe',
  cwd: process.cwd(),
  env: { ...process.env }
});

let inputQueue = [];
let ready = false;

function sendNext() {
  if (inputQueue.length > 0) {
    const input = inputQueue.shift();
    proc.stdin.write(input);
    setTimeout(sendNext, 50);
  }
}

proc.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);
  
  // Detect when we need to send input based on prompts
  if (text.includes('Select version option')) {
    inputQueue.push('\n');  // Enter to keep current version
    sendNext();
  } else if (text.includes('Select platform')) {
    inputQueue.push('1\n');  // Windows
    sendNext();
  } else if (text.includes('Select compression')) {
    inputQueue.push('2\n');  // Normal
    sendNext();
  } else if (text.includes('Start build?')) {
    inputQueue.push('\n');  // Y
    sendNext();
  }
});

proc.stderr.on('data', (data) => process.stderr.write(data.toString()));

proc.on('close', (code) => {
  process.exit(code);
});

proc.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});