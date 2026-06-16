import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcImages = {
  'iron-haven-gym.webp': './src/assets/images/iron_haven_gym_1781599129426.jpg',
  'advocate-platform.webp': './src/assets/images/advocate_platform_1781599152324.jpg',
  'real-estate.webp': './src/assets/images/real_estate_1781599173445.jpg',
  'vakil-co.webp': './src/assets/images/vakil_co_1781629384889.jpg',
  'dentacare-pro.webp': './src/assets/images/dentacare_pro_1781629403721.jpg'
};

const outputDirs = ['./public/assets/images', './src/assets/images', './assets/images', './public/images', './images'];

outputDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function convertAndResize(filename, sourcePath) {
  console.log(`Processing: ${sourcePath} -> ${filename}`);
  
  // We want the file size to be strictly between 80KB (81920 bytes) and 150KB (153600 bytes)
  const minSize = 80 * 1024; // 81920
  const maxSize = 150 * 1024; // 153600
  
  let quality = 80;
  let width = 1024;
  let buffer;
  let iterations = 0;
  
  while (iterations < 20) {
    buffer = await sharp(sourcePath)
      .resize({ width: width, height: Math.round(width * 9/16) })
      .webp({ quality: quality })
      .toBuffer();
    
    const size = buffer.length;
    console.log(`Iteration ${iterations}: width=${width}, quality=${quality} -> size=${(size/1024).toFixed(2)} KB`);
    
    if (size >= minSize && size <= maxSize) {
      break;
    } else if (size < minSize) {
      // Scale up quality or dimension to increase file size
      if (quality < 98) {
        quality = Math.min(98, quality + 5);
      } else {
        width = Math.round(width * 1.15);
      }
    } else {
      // Scale down quality or dimension to decrease file size
      if (quality > 40) {
        quality = Math.max(30, quality - 5);
      } else {
        width = Math.round(width * 0.85);
      }
    }
    iterations++;
  }
  
  for (const dir of outputDirs) {
    const destPath = path.join(dir, filename);
    fs.writeFileSync(destPath, buffer);
    const finalSize = fs.statSync(destPath).size;
    console.log(`Saved ${filename} (${(finalSize/1024).toFixed(2)} KB) to ${destPath}`);
  }
}

async function run() {
  for (const [filename, sourcePath] of Object.entries(srcImages)) {
    await convertAndResize(filename, sourcePath);
  }
}

run().catch(err => {
  console.error("Error processing images:", err);
  process.exit(1);
});
