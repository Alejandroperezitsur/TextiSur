// Simple placeholder icon generator using Canvas (browser environment)
// This should be run in a browser or with node-canvas package

const fs = require('fs');
const path = require('path');

// For Node.js, you'll need: npm install canvas
const { createCanvas } = require('canvas');

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function generateIcon(size, isMaskable = false) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;

    if (isMaskable) {
        // Square for maskable
        ctx.fillRect(0, 0, size, size);
    } else {
        // Rounded rectangle for regular icons
        const radius = size * 0.2;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
    }

    // Draw "TS" text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TS', size / 2, size * 0.6);

    // Draw simple hanger icon above text
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.3, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Hanger hook
    ctx.beginPath();
    ctx.moveTo(size * 0.35, size * 0.3);
    ctx.lineTo(size * 0.65, size * 0.3);
    ctx.lineWidth = size * 0.02;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    return canvas.toBuffer('image/png');
}

console.log('🎨 Generating PWA icons...\n');

// Generate all standard icons
SIZES.forEach(size => {
    const buffer = generateIcon(size, false);
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`;
    fs.writeFileSync(path.join(iconsDir, filename), buffer);
    console.log(`✅ Created ${filename}`);
});

// Generate maskable icons
[192, 512].forEach(size => {
    const buffer = generateIcon(size, true);
    fs.writeFileSync(path.join(iconsDir, `icon-maskable-${size}x${size}.png`), buffer);
    console.log(`✅ Created icon-maskable-${size}x${size}.png`);
});

// Generate favicon and badge
const faviconBuffer = generateIcon(32, false);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.png'), faviconBuffer);
console.log('✅ Created favicon.png');

const badgeBuffer = generateIcon(72, false);
fs.writeFileSync(path.join(iconsDir, 'badge-72x72.png'), badgeBuffer);
console.log('✅ Created badge-72x72.png');

console.log('\n✨ All icons generated successfully!');
console.log(`📁 Icons saved to: ${iconsDir}`);
