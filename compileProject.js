const fs = require('fs');
const path = require('path');

// Base project directory - KEEP THIS AS THE ABSOLUTE ROOT OF YOUR PROJECT
const baseProjectDir = 'C:\\Users\\Ty\\source\\repos\\Personal-Profile\\my-profile-website';
const outputFile = 'project_summary.txt';

// Configuration
const MAX_FILE_SIZE = 1024 * 1024; // 1MB limit
const RELEVANT_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',  // JavaScript/TypeScript files
  '.html', '.css', '.scss',      // Web files
  '.json', '.md',                // Config and documentation
  '.txt'                         // Text files
];

const SKIP_FILES = [
  'node_modules',
  '.git',
  '.gitignore',
  'package-lock.json',
  'package.json',
  'project_summary.txt', // The output file itself
  '.map',  // Skip source map files
  'main.30bebfa5.css', // Skip the specific CSS file
];

const SKIP_DIRECTORIES = [
  'build',  // Skip the entire build directory
  'node_modules',
  '.git',
  'processed'  // Skip the processed directory entirely
];

const SKIP_CONTENTS_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.ico', '.svg',  // Images
  '.map',  // Source maps
  '.ttf', '.woff', '.woff2', '.eot'  // Fonts
];

// Additional patterns to skip chunk files specifically
const SKIP_PATTERNS = [
  /chunk\d+\.js$/,  // Skip any file matching "chunk" followed by numbers and .js
  /^chunk/          // Skip any file starting with "chunk"
];

const shouldSkipFile = (fileName, filePath) => {
  // Check if file matches skip patterns
  if (SKIP_PATTERNS.some(pattern => pattern.test(fileName))) {
    return true;
  }

  // Check if file is in skip files list
  if (SKIP_FILES.some(skip => fileName.includes(skip) || fileName === skip)) { // Added direct match for exact filenames
    return true;
  }

  // Check if file path contains "processed" anywhere in the path
  // This is a bit broad; consider if you only want to skip top-level "processed" directories.
  // For now, it matches the original logic.
  if (filePath.toLowerCase().includes(path.sep + 'processed' + path.sep) || filePath.toLowerCase().endsWith(path.sep + 'processed')) {
    return true;
  }

  return false;
};

const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const dirName = path.basename(dirPath);

  // Skip entire directories based on SKIP_DIRECTORIES
  if (SKIP_DIRECTORIES.includes(dirName)) {
    console.log(`Skipping directory based on SKIP_DIRECTORIES: ${dirPath}`);
    return arrayOfFiles;
  }

  // Skip if directory path contains "processed" (more specific check)
  if (dirPath.toLowerCase().includes(path.sep + 'processed' + path.sep) || dirPath.toLowerCase().endsWith(path.sep + 'processed')) {
    console.log(`Skipping directory because it's a 'processed' path: ${dirPath}`);
    return arrayOfFiles;
  }

  let files;
  try {
    files = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Error reading directory ${dirPath}: ${err.message}`);
    return arrayOfFiles; // Stop processing this path if unreadable
  }


  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    // Check if the directory itself (the component of fullPath) should be skipped
    if (fs.statSync(fullPath).isDirectory()) {
        const currentDirName = path.basename(fullPath);
        if (SKIP_DIRECTORIES.includes(currentDirName)) {
            console.log(`Skipping directory component: ${fullPath}`);
            return;
        }
        // Recursive call for directories
        getAllFiles(fullPath, arrayOfFiles);
    } else {
        // File-specific checks
        if (shouldSkipFile(file, fullPath)) {
            console.log(`Skipping file: ${fullPath}`);
            return;
        }
        const ext = path.extname(file).toLowerCase();
        if (RELEVANT_EXTENSIONS.includes(ext)) {
            arrayOfFiles.push(fullPath);
        }
    }
  });

  return arrayOfFiles;
};

const getFilePreview = (filePath) => {
  const stats = fs.statSync(filePath);
  const extension = path.extname(filePath).toLowerCase();

  // Skip binary files and source maps
  if (SKIP_CONTENTS_EXTENSIONS.includes(extension)) {
    return `[${extension.substring(1)} file content skipped]`;
  }

  // Check file size
  if (stats.size > MAX_FILE_SIZE) {
    return `[File too large: ${(stats.size / (1024 * 1024)).toFixed(2)}MB, content skipped]`;
  }

  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return `[Error reading file: ${error.message}]`;
  }
};

const compileProjectFiles = (scanDirPath, outputFilePath) => {
  console.log(`Scanning directory: ${scanDirPath}`);
  const filesToInclude = getAllFiles(scanDirPath);
  let content = `Project Summary for: ${path.relative(baseProjectDir, scanDirPath) || '.'}\n`;
  content += `Base Project Directory: ${baseProjectDir}\n`;
  content += `Scanned Path: ${scanDirPath}\n\n`;
  content += 'Folder Structure:\n\n';

  // Add folder structure relative to scanDirPath
  const addFolderStructure = (currentPath, indent = '') => {
    const currentDirName = path.basename(currentPath);

    // Skip directories listed in SKIP_DIRECTORIES
    if (SKIP_DIRECTORIES.includes(currentDirName) && currentPath !== scanDirPath) { // Don't skip the root scanDirPath itself if it's named like a skip_dir
      content += `${indent}${currentDirName}/ (ignored by SKIP_DIRECTORIES)\n`;
      console.log(`Folder Structure: Skipping directory ${currentPath} due to SKIP_DIRECTORIES`);
      return;
    }

    // Skip if directory path contains "processed"
    if ((currentPath.toLowerCase().includes(path.sep + 'processed' + path.sep) || currentPath.toLowerCase().endsWith(path.sep + 'processed')) && currentPath !== scanDirPath) {
        content += `${indent}${currentDirName}/ (ignored, 'processed' path)\n`;
        console.log(`Folder Structure: Skipping directory ${currentPath} because it's a 'processed' path`);
        return;
    }

    let items;
    try {
        items = fs.readdirSync(currentPath);
    } catch (err) {
        content += `${indent}${currentDirName}/ (Error reading: ${err.message})\n`;
        console.error(`Folder Structure: Error reading directory ${currentPath}: ${err.message}`);
        return;
    }


    items.forEach((item) => {
      const fullItemPath = path.join(currentPath, item);
      let itemStat;
      try {
        itemStat = fs.statSync(fullItemPath);
      } catch (e) {
        content += `${indent}${item} (Error stating file/dir)\n`;
        return;
      }

      if (itemStat.isDirectory()) {
        // Check if this directory itself should be skipped before recursing
        const subDirName = path.basename(fullItemPath);
        if (SKIP_DIRECTORIES.includes(subDirName)) {
          content += `${indent}${item}/ (ignored by SKIP_DIRECTORIES)\n`;
          console.log(`Folder Structure: Skipping sub-directory ${fullItemPath} due to SKIP_DIRECTORIES`);
          return;
        }
        if (fullItemPath.toLowerCase().includes(path.sep + 'processed' + path.sep) || fullItemPath.toLowerCase().endsWith(path.sep + 'processed')) {
            content += `${indent}${item}/ (ignored, 'processed' path)\n`;
            console.log(`Folder Structure: Skipping sub-directory ${fullItemPath} because it's a 'processed' path`);
            return;
        }
        if (shouldSkipFile(item, fullItemPath)) { // Using shouldSkipFile for directories too, if it makes sense (e.g. .git)
            content += `${indent}${item}/ (ignored by skip rules)\n`;
            console.log(`Folder Structure: Skipping directory ${fullItemPath} due to shouldSkipFile`);
            return;
        }
        content += `${indent}${item}/\n`;
        addFolderStructure(fullItemPath, indent + '  ');
      } else {
        if (shouldSkipFile(item, fullItemPath)) {
          // content += `${indent}${item} (ignored by skip rules)\n`; // Optionally show skipped files in structure
          return;
        }
        const ext = path.extname(item).toLowerCase();
        if (RELEVANT_EXTENSIONS.includes(ext)) {
            content += `${indent}${item}\n`;
        } else {
            // content += `${indent}${item} (irrelevant extension)\n`; // Optionally show non-relevant files
        }
      }
    });
  };

  addFolderStructure(scanDirPath);
  content += '\n\n---\n\nProject Files Content:\n\n';

  // Add file contents
  filesToInclude.forEach((file) => {
    // Make file path relative to the scanned directory for the output
    const relativePath = path.relative(scanDirPath, file);
    content += `\n\n---\n\nFile: ${relativePath}\n\n`;
    content += getFilePreview(file);
  });

  try {
    fs.writeFileSync(outputFilePath, content, 'utf-8');
    console.log(`Project files compiled into ${outputFilePath}`);
    console.log(`Total files included: ${filesToInclude.length}`);
  } catch (err) {
    console.error(`Error writing to output file ${outputFilePath}: ${err.message}`);
  }
};

// --- Main Execution ---
const targetSubFolder = process.argv[2]; // Get the folder name from the command line
let dirToScan;

if (targetSubFolder) {
  dirToScan = path.resolve(baseProjectDir, targetSubFolder); // Use resolve for robust path creation
  if (!fs.existsSync(dirToScan)) {
    console.error(`Error: The specified folder "${targetSubFolder}" does not exist inside "${baseProjectDir}".`);
    console.error(`Full path attempted: ${dirToScan}`);
    process.exit(1);
  }
  if (!fs.statSync(dirToScan).isDirectory()) {
    console.error(`Error: The specified path "${targetSubFolder}" is not a directory.`);
    console.error(`Full path attempted: ${dirToScan}`);
    process.exit(1);
  }
  console.log(`Targeting subfolder: ${targetSubFolder}`);
} else {
  dirToScan = path.resolve(baseProjectDir); // Default to base project directory
  console.log('No specific folder provided. Targeting the entire base project directory.');
}

const actualOutputFile = path.join(baseProjectDir, outputFile); // Output file in the base project directory

compileProjectFiles(dirToScan, actualOutputFile);

console.log("\nScript finished.");
console.log("Remember to check console logs for skipped files/directories if the output seems incomplete.");