const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\Ty\\source\\repos\\Personal-Profile\\my-profile-website';
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
  'project_summary.txt',
  '.map',  // Skip source map files
  'main.30bebfa5.css', // Skip the specific CSS file
];

const SKIP_DIRECTORIES = [
  'build',  // Skip the entire build directory
  'node_modules',
  '.git'
];

const SKIP_CONTENTS_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.ico', '.svg',  // Images
  '.map',  // Source maps
  '.ttf', '.woff', '.woff2', '.eot'  // Fonts
];

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  // Skip entire directories
  const dirName = path.basename(dirPath);
  if (SKIP_DIRECTORIES.includes(dirName)) {
    return arrayOfFiles;
  }

  files.forEach((file) => {
    if (SKIP_FILES.some(skip => file.includes(skip))) {
      return;
    }
    
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
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
    return `[${extension.substring(1)} file]`;
  }

  // Check file size
  if (stats.size > MAX_FILE_SIZE) {
    return `[File too large: ${(stats.size / (1024 * 1024)).toFixed(2)}MB]`;
  }

  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return `[Error reading file: ${error.message}]`;
  }
};

const compileProjectFiles = (dirPath, outputFile) => {
  const files = getAllFiles(dirPath);
  let content = 'Project Folder Structure:\n\n';

  // Add folder structure
  const addFolderStructure = (dirPath, indent = '') => {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      // Skip directories in folder structure
      if (SKIP_DIRECTORIES.includes(file)) {
        content += `${indent}${file}/ (ignored)\n`;
        return;
      }
      if (SKIP_FILES.some(skip => file.includes(skip))) {
        content += `${indent}${file}/ (ignored)\n`;
        return;
      }
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        content += `${indent}${file}/\n`;
        addFolderStructure(filePath, indent + '  ');
      } else {
        content += `${indent}${file}\n`;
      }
    });
  };

  addFolderStructure(dirPath);
  content += '\n\n---\n\nProject Files Content:\n\n';

  // Add file contents
  files.forEach((file) => {
    const relativePath = path.relative(dirPath, file);
    content += `\n\n---\n\nFile: ${relativePath}\n\n`;
    content += getFilePreview(file);
  });

  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`Project files compiled into ${outputFile}`);
};

compileProjectFiles(projectDir, outputFile);