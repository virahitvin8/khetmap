// PWA Icon Generator
// Usage: node gen-icons.mjs
// Generates icon-192.png and icon-512.png from icon.svg

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateIcons() {
  // Since we can't directly load SVG with 'canvas' package,
  // we'll create the icons programmatically with the KhetMap logo design
  const sizes = [192, 512];
  
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const pad = size * 0.08;
    const inner = size - pad * 2;
    const radius = size * 0.18;
    
    // Background rounded rect
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#2563EB');
    grad.addColorStop(1, '#1D4ED8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pad + radius, pad);
    ctx.lineTo(pad + inner - radius, pad);
    ctx.quadraticCurveTo(pad + inner, pad, pad + inner, pad + radius);
    ctx.lineTo(pad + inner, pad + inner - radius);
    ctx.quadraticCurveTo(pad + inner, pad + inner, pad + inner - radius, pad + inner);
    ctx.lineTo(pad + radius, pad + inner);
    ctx.quadraticCurveTo(pad, pad + inner, pad, pad + inner - radius);
    ctx.lineTo(pad, pad + radius);
    ctx.quadraticCurveTo(pad, pad, pad + radius, pad);
    ctx.closePath();
    ctx.fill();
    
    // Map pin (stylized)
    const cx = size / 2;
    const cy = size * 0.52;
    const pinSize = size * 0.35;
    
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.03;
    ctx.beginPath();
    ctx.arc(cx, cy - pinSize * 0.1, pinSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Leaf shape inside pin
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.035;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Left leaf
    ctx.beginPath();
    ctx.moveTo(cx, cy - pinSize * 0.5);
    ctx.quadraticCurveTo(cx - pinSize * 0.35, cy - pinSize * 0.2, cx, cy + pinSize * 0.35);
    ctx.stroke();
    
    // Right leaf
    ctx.beginPath();
    ctx.moveTo(cx, cy - pinSize * 0.5);
    ctx.quadraticCurveTo(cx + pinSize * 0.35, cy - pinSize * 0.2, cx, cy + pinSize * 0.35);
    ctx.stroke();
    
    // Leaf center line
    ctx.beginPath();
    ctx.moveTo(cx - pinSize * 0.2, cy - pinSize * 0.08);
    ctx.lineTo(cx + pinSize * 0.2, cy - pinSize * 0.08);
    ctx.stroke();
    
    // Satellite dish (top right)
    const dishX = size * 0.78;
    const dishY = size * 0.22;
    const dishR = size * 0.06;
    
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = size * 0.025;
    ctx.beginPath();
    ctx.arc(dishX, dishY, dishR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(dishX, dishY + dishR);
    ctx.lineTo(dishX, dishY + dishR * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(dishX, dishY + dishR * 1.5);
    ctx.lineTo(dishX - dishR * 0.8, dishY + dishR * 2.5);
    ctx.moveTo(dishX, dishY + dishR * 1.5);
    ctx.lineTo(dishX + dishR * 0.8, dishY + dishR * 2.5);
    ctx.stroke();
    
    // Save to file
    const filename = size === 192 ? 'icon-192.png' : 'icon-512.png';
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, filename), buffer);
    console.log(`✅ Generated ${filename} (${size}x${size})`);
  }
  
  console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
