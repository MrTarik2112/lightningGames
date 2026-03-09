const { createCanvas } = require('canvas');
const fs = require('fs');

const size = 1024;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#050510';
ctx.fillRect(0, 0, size, size);

const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.7);
gradient.addColorStop(0, '#0a1628');
gradient.addColorStop(1, '#050510');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, size, size);

ctx.beginPath();
ctx.arc(size/2, size/2, size * 0.42, 0, Math.PI * 2);
ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
ctx.lineWidth = 8;
ctx.stroke();

ctx.beginPath();
ctx.arc(size/2, size/2, size * 0.38, 0, Math.PI * 2);
ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
ctx.lineWidth = 4;
ctx.stroke();

const cx = size / 2;
const cy = size / 2;
const s = size * 0.32;

ctx.shadowColor = '#00d4ff';
ctx.shadowBlur = 80;
ctx.fillStyle = '#00d4ff';
ctx.beginPath();
ctx.moveTo(cx + s * 0.5, cy - s);
ctx.lineTo(cx - s * 0.5, cy);
ctx.lineTo(cx - s * 0.1, cy);
ctx.lineTo(cx - s * 0.3, cy + s * 0.35);
ctx.lineTo(cx + s * 0.2, cy - s * 0.1);
ctx.lineTo(cx - s * 0.1, cy - s * 0.1);
ctx.lineTo(cx + s * 0.5, cy + s);
ctx.lineTo(cx + s * 0.2, cy);
ctx.lineTo(cx - s * 0.2, cy);
ctx.closePath();
ctx.fill();

ctx.shadowBlur = 30;
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.moveTo(cx + s * 0.35, cy - s * 0.7);
ctx.lineTo(cx - s * 0.35, cy);
ctx.lineTo(cx - s * 0.07, cy);
ctx.lineTo(cx - s * 0.21, cy + s * 0.25);
ctx.lineTo(cx + s * 0.14, cy - s * 0.07);
ctx.lineTo(cx - s * 0.07, cy - s * 0.07);
ctx.lineTo(cx + s * 0.35, cy + s * 0.7);
ctx.lineTo(cx + s * 0.14, cy);
ctx.lineTo(cx - s * 0.14, cy);
ctx.closePath();
ctx.fill();

ctx.shadowBlur = 0;

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('assets/icon.png', buffer);
console.log('PNG created: assets/icon.png');
