// validateChunks.js
const fs = require('fs');
const path = require('path');

// Configuration
const CHUNKS_DIR = './src/music/chunks';
const OUTPUT_PATH = './src/music/fixed-audio.js';

console.log('Validating audio chunks...');

try {
  // Get all chunk files
  const chunkFiles = fs.readdirSync(CHUNKS_DIR)
    .filter(file => file.startsWith('chunk') && file.endsWith('.js'))
    .sort((a, b) => {
      // Sort numerically by chunk number
      const numA = parseInt(a.match(/chunk(\d+)/)[1]);
      const numB = parseInt(b.match(/chunk(\d+)/)[1]);
      return numA - numB;
    });
    
  console.log(`Found ${chunkFiles.length} chunk files: ${chunkFiles.join(', ')}`);
  
  // Read the contents of each chunk
  const chunks = [];
  for (const file of chunkFiles) {
    const filePath = path.join(CHUNKS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the Base64 string from the chunk file
    const match = content.match(/export default\s+["']([^"']+)["']/);
    if (match && match[1]) {
      chunks.push({
        file,
        base64: match[1],
        length: match[1].length
      });
    } else {
      console.error(`Could not extract Base64 string from ${file}`);
    }
  }
  
  console.log('\nChunk information:');
  chunks.forEach(chunk => {
    console.log(`${chunk.file}: ${chunk.length} characters`);
    console.log(`  First 20 chars: ${chunk.base64.substring(0, 20)}`);
    console.log(`  Last 20 chars: ${chunk.base64.substring(chunk.base64.length - 20)}`);
    
    // Check for valid Base64 characters
    const validBase64Pattern = /^[A-Za-z0-9+/=]+$/;
    const isValidBase64 = validBase64Pattern.test(chunk.base64);
    console.log(`  Valid Base64 characters: ${isValidBase64}`);
    
    if (!isValidBase64) {
      const invalidChars = [...new Set(chunk.base64.match(/[^A-Za-z0-9+/=]/g))];
      console.log(`  Invalid characters: ${JSON.stringify(invalidChars)}`);
    }
    
    // Warn if length is not divisible by 4
    if (chunk.base64.length % 4 !== 0) {
      console.log(`  Warning: Length ${chunk.base64.length} is not divisible by 4`);
    }
  });
  
  // Create a combined Base64 string
  const combinedBase64 = chunks.map(chunk => chunk.base64).join('');
  console.log(`\nCombined Base64 length: ${combinedBase64.length} characters`);
  
  // Check if combined is valid Base64
  const validBase64Pattern = /^[A-Za-z0-9+/=]+$/;
  const isValidBase64 = validBase64Pattern.test(combinedBase64);
  console.log(`Combined Base64 is valid: ${isValidBase64}`);
  
  // Generate a fixed audio file
  console.log(`\nGenerating fixed audio file at ${OUTPUT_PATH}...`);
  const fileContent = `/* eslint-disable */
// Fixed audio file with direct Base64 string
export default "${combinedBase64}";
/* eslint-enable */`;

  fs.writeFileSync(OUTPUT_PATH, fileContent);
  console.log('Fixed audio file generated successfully!');
  
  console.log('\n--- Usage Instructions ---');
  console.log('1. In your MusicPage.js, replace:');
  console.log('   import audioBase64 from \'./music/audioBase64.js\';');
  console.log('   with:');
  console.log('   import audioBase64 from \'./music/fixed-audio.js\';');
  
} catch (error) {
  console.error('Error:', error);
}