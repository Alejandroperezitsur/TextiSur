import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const sourceIcon = path.join(iconsDir, 'icon-512x512.png');

async function generateIcons() {
  console.log('🎨 Generating PWA icons from base...\n');

  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found at', sourceIcon);
    return;
  }

  try {
    // Generate standard icons
    for (const size of SIZES) {
      if (size === 512) continue; // Already have 512x512
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(sourceIcon)
        .resize(size, size, { fit: 'contain', background: { r: 99, g: 102, b: 241, alpha: 1 } })
        .png()
        .toFile(outputPath);
      console.log(`✅ Created icon-${size}x${size}.png`);
    }

    // Generate maskable icons (10% padding for safe zone)
    for (const size of MASKABLE_SIZES) {
      const outputPath = path.join(iconsDir, `icon-maskable-${size}x${size}.png`);
      const paddedSize = Math.floor(size * 0.8);
      const padding = Math.floor((size - paddedSize) / 2);

      await sharp(sourceIcon)
        .resize(paddedSize, paddedSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 99, g: 102, b: 241, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ Created icon-maskable-${size}x${size}.png`);
    }

    // Apple touch icon
    const appleTouchIconPath = path.join(iconsDir, 'apple-touch-icon.png');
    await sharp(sourceIcon)
      .resize(180, 180)
      .png()
      .toFile(appleTouchIconPath);
    console.log('✅ Created apple-touch-icon.png');

    // Favicon
    const faviconPath = path.join(__dirname, '..', 'public', 'favicon.png');
    await sharp(sourceIcon)
      .resize(32, 32)
      .png()
      .toFile(faviconPath);
    console.log('✅ Created favicon.png');

    // Badge for notifications
    const badgePath = path.join(iconsDir, 'badge-72x72.png');
    await sharp(sourceIcon)
      .resize(72, 72)
      .png()
      .toFile(badgePath);
    console.log('✅ Created badge-72x72.png');

    console.log('\n✨ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateIcons();
