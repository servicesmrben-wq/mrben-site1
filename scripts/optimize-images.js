const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const TARGET_SIZE_MB = 0.5; // Target size for optimized images (500KB)

async function optimizeImages() {
  console.log('--- Starting Image Optimization ---');
  
  const files = fs.readdirSync(PUBLIC_DIR);
  
  for (const file of files) {
    const filePath = path.join(PUBLIC_DIR, file);
    const stats = fs.statSync(filePath);
    
    // Only process large JPEGs/PNGs (over 1MB)
    if (stats.isFile() && stats.size > 1 * 1024 * 1024 && /\.(jpg|jpeg|png)$/i.test(file)) {
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`Optimizing: ${file} (${sizeMB} MB)`);
      
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      const backupPath = path.join(PUBLIC_DIR, `${name}-original${ext}`);
      
      // Keep a backup of the original just in case
      fs.copyFileSync(filePath, backupPath);
      
      try {
        await sharp(backupPath)
          .resize(1920, null, { withoutEnlargement: true }) // Limit width to 1920px
          .jpeg({ quality: 80, progressive: true }) // Good balance of quality/size
          .toFile(filePath);
          
        const newStats = fs.statSync(filePath);
        const newSizeMB = (newStats.size / (1024 * 1024)).toFixed(2);
        console.log(`  -> Success: New size is ${newSizeMB} MB`);
        
        // If it's still large, we could convert to WebP too
        const webpPath = path.join(PUBLIC_DIR, `${name}.webp`);
        await sharp(backupPath)
          .resize(1920, null, { withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(webpPath);
        console.log(`  -> Generated WebP version: ${name}.webp`);
        
      } catch (err) {
        console.error(`  !! Error optimizing ${file}:`, err.message);
      }
    }
  }
  
  console.log('--- Optimization Complete ---');
  console.log('Note: Originals have been kept with "-original" suffix. Verify the results and delete them when ready.');
}

optimizeImages();
