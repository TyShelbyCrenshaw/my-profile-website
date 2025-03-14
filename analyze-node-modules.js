// Save this as analyze-node-modules-file.js
const fs = require('fs');
const path = require('path');

// File to save results
const outputFile = 'node-modules-analysis.txt';
const outputStream = fs.createWriteStream(outputFile);

// Function to write to both console and file
function log(message) {
  console.log(message);
  outputStream.write(message + '\n');
}

// Function to get directory size recursively
function getDirectorySize(dirPath) {
  let size = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        size += getDirectorySize(itemPath);
      } else {
        size += stats.size;
      }
    }
  } catch (err) {
    log(`Error reading ${dirPath}: ${err.message}`);
  }
  
  return size;
}

// Format size to human-readable format
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Analyze node_modules folder
function analyzeNodeModules() {
  const modulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(modulesPath)) {
    log('node_modules folder not found!');
    return;
  }
  
  // Get total size first
  const totalSize = getDirectorySize(modulesPath);
  log(`Total node_modules size: ${formatSize(totalSize)}\n`);
  
  // Get all top-level folders
  const items = fs.readdirSync(modulesPath);
  const folderSizes = [];
  
  log('Analyzing folder sizes (this may take a while)...\n');
  
  // Process each item
  for (const item of items) {
    const itemPath = path.join(modulesPath, item);
    
    try {
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        if (item.startsWith('@')) {
          // Handle scoped packages
          const scopedItems = fs.readdirSync(itemPath);
          for (const scopedItem of scopedItems) {
            const scopedPath = path.join(itemPath, scopedItem);
            if (fs.statSync(scopedPath).isDirectory()) {
              const size = getDirectorySize(scopedPath);
              folderSizes.push({
                name: `${item}/${scopedItem}`,
                size,
                formattedSize: formatSize(size),
                percentage: (size / totalSize) * 100
              });
            }
          }
        } else {
          // Regular package
          const size = getDirectorySize(itemPath);
          folderSizes.push({
            name: item,
            size,
            formattedSize: formatSize(size),
            percentage: (size / totalSize) * 100
          });
        }
      }
    } catch (err) {
      log(`Error processing ${itemPath}: ${err.message}`);
    }
  }
  
  // Sort by size (largest first)
  folderSizes.sort((a, b) => b.size - a.size);
  
  // Print results
  log('Folders sorted by size (largest first):');
  log('----------------------------------------');
  
  let cumulativePercentage = 0;
  for (const folder of folderSizes) {
    cumulativePercentage += folder.percentage;
    log(`${folder.name.padEnd(40)} ${folder.formattedSize.padStart(10)} (${folder.percentage.toFixed(2)}%)`);
    
    // Print a divider after reaching 50% and 75% of the total size
    if (cumulativePercentage >= 50 && (cumulativePercentage - folder.percentage) < 50) {
      log('---------------- 50% of total size ----------------');
    } else if (cumulativePercentage >= 75 && (cumulativePercentage - folder.percentage) < 75) {
      log('---------------- 75% of total size ----------------');
    }
  }
  
  // Summary statistics
  const topTenSize = folderSizes.slice(0, 10).reduce((sum, folder) => sum + folder.size, 0);
  const topTenPercentage = (topTenSize / totalSize) * 100;
  
  log('\nSummary:');
  log(`- Total number of packages: ${folderSizes.length}`);
  log(`- Top 10 packages: ${formatSize(topTenSize)} (${topTenPercentage.toFixed(2)}% of total)`);
  
  // Check for nested node_modules folders
  log('\nChecking for nested node_modules folders...');
  findNestedNodeModules(modulesPath);
  
  // Close the file stream
  outputStream.end(() => {
    console.log(`\nAnalysis complete! Results saved to ${outputFile}`);
  });
}

// Find nested node_modules folders
function findNestedNodeModules(startDir, level = 1, maxDepth = 5) {
  if (level > maxDepth) return;
  
  try {
    const items = fs.readdirSync(startDir);
    
    for (const item of items) {
      const itemPath = path.join(startDir, item);
      
      try {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          if (item === 'node_modules' && startDir.includes('node_modules')) {
            // This is a nested node_modules folder
            const size = getDirectorySize(itemPath);
            log(`- Nested node_modules found: ${itemPath}`);
            log(`  Size: ${formatSize(size)}`);
          } else {
            // Recursively check subdirectories
            findNestedNodeModules(itemPath, level + 1, maxDepth);
          }
        }
      } catch (err) {
        // Skip items we can't access
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
}

// Run the analysis
log('Node Modules Size Analyzer');
log('==========================');
analyzeNodeModules();