# Creating an Installer Icon

## Option 1: Use Online Icon Generator

1. Visit https://www.icoconverter.com/ or https://convertio.co/png-ico/
2. Upload a PNG image (256x256 or 512x512 recommended)
3. Download as `.ico` file
4. Save as `installer/assets/icon.ico`

## Option 2: Use ImageMagick (if installed)

```bash
convert icon.png -resize 256x256 installer/assets/icon.ico
```

## Option 3: Use GIMP or Photoshop

1. Create a 256x256 or 512x512 image
2. Export as `.ico` format
3. Save as `installer/assets/icon.ico`

## Option 4: Use a Simple Icon Generator Script

Create a simple icon using Node.js:

```javascript
// create-icon.js
const fs = require('fs');
const { createCanvas } = require('canvas');

const size = 256;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = '#667eea';
ctx.fillRect(0, 0, size, size);

// Draw restaurant icon (fork and knife)
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 120px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('🍽️', size/2, size/2);

// Save as PNG (then convert to ICO)
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('installer/assets/icon.png', buffer);
```

## Recommended Icon Design

- **Size**: 256x256 or 512x512 pixels
- **Format**: ICO (Windows icon format)
- **Design**: Restaurant/food related icon (fork, plate, POS terminal)
- **Colors**: Match your brand colors (#667eea, #764ba2)

## Quick Solution

If you just want to get started quickly, you can:
1. Download any free restaurant icon from https://www.flaticon.com/
2. Convert it to ICO format using an online converter
3. Save as `installer/assets/icon.ico`

The installer will work without a custom icon, but Windows will show a default Electron icon.



