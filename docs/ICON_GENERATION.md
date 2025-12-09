# PWA Icon Generation Guide

Since automated icon generation had issues, here are ways to create the icons:

## Option 1: Use AI-Generated Base Icon

I've created a base icon design for TextiSur. To generate all required sizes:

1. Use an online tool like:
   - **Real Favicon Generator**: https://realfavicongenerator.net/
   - **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   
2. Upload the base icon image from: `C:\Users\Alejandro\.gemini\antigravity\brain\02d09833-f884-4bc1-a9bd-dadf4f5e9ac7\textisur_icon_base_1765296111453.png`

3. Download the generated icon pack

4. Extract files to `public/icons/` directory

## Option 2: Manual Generation with Sharp

If you want to use the script:

```bash
# Install canvas (optional dependency)
npm install canvas

# Run the canvas-based generator
node scripts/generate-icons-canvas.js
```

## Option 3: Use Figma/Photoshop

1. Create 1024x1024 design:
   - Background: Gradient from #6366f1 to #8b5cf6
   - Text: Bold white "TS" in center
   - Icon: Simple white hanger symbol above text

2. Export as PNG at these sizes:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - Maskable: 192x192, 512x512 (with 20% padding)
   - Apple: 180x180
   - Favicon: 32x32

3. Save to `public/icons/` with naming convention: `icon-{size}x{size}.png`

## Required Icons

Save these files in `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- icon-maskable-192x192.png
- icon-maskable-512x512.png
- apple-touch-icon.png (180x180)
- badge-72x72.png

Also save to `public/`:
- favicon.png (32x32)

## Current Status

The PWA will work without icons, but installation experience will be degraded. The manifest references the icons, so once you add them, they'll be automatically detected.
