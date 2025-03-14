// chunkAudioFile.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib'); // Node.js built-in compression library

// Configuration
const AUDIO_FILE_PATH = './src/music/bang-crash-103775.mp3'; // Change to your audio file path
const OUTPUT_DIR = './src/music/chunks';
const CHUNK_SIZE = 50000; // Adjust based on your needs
const INDEX_FILE_PATH = './src/music/audioBase64.js';
const USE_COMPRESSION = true; // Toggle compression

// Create directory for chunks if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`Creating directory ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Custom Run-Length Encoding for base64 strings
// This can help with repetitive sequences in the base64 data
function runLengthEncode(str) {
  let encoded = '';
  let count = 1;
  let prevChar = str[0];
  
  for (let i = 1; i < str.length; i++) {
    if (str[i] === prevChar) {
      count++;
    } else {
      // Only use RLE when we have 4+ consecutive characters
      // (otherwise it would take more space than the original)
      if (count >= 4) {
        encoded += `${count}${prevChar}`;
      } else {
        encoded += prevChar.repeat(count);
      }
      prevChar = str[i];
      count = 1;
    }
  }
  
  // Handle the last character
  if (count >= 4) {
    encoded += `${count}${prevChar}`;
  } else {
    encoded += prevChar.repeat(count);
  }
  
  return encoded;
}

// Custom Run-Length Decoding for base64 strings
function runLengthDecode(str) {
    if (!str || typeof str !== 'string') {
      console.error('Invalid input to runLengthDecode:', str);
      return '';
    }
  
    let decoded = '';
    let i = 0;
    
    while (i < str.length) {
      // Check if current character is a digit
      let count = '';
      while (i < str.length && !isNaN(parseInt(str[i]))) {
        count += str[i];
        i++;
      }
      
      if (count !== '' && i < str.length) {
        // We found a run-length encoded sequence
        const char = str[i];
        if (char !== undefined) {
          try {
            decoded += char.repeat(parseInt(count));
          } catch (e) {
            console.error('Error in runLengthDecode:', e, 'char:', char, 'count:', count);
            // Fallback: just add what we can
            decoded += char || '';
          }
        }
        i++;
      } else if (i < str.length) {
        // Regular character
        decoded += str[i];
        i++;
      } else {
        // End of string reached while parsing a number
        // Just add the number as is
        if (count !== '') {
          decoded += count;
        }
        break;
      }
    }
    
    return decoded;
  }

// Main processing function
async function processAudioFile() {
  try {
    // Read the audio file
    console.log(`Reading audio file from ${AUDIO_FILE_PATH}...`);
    const audioFile = fs.readFileSync(AUDIO_FILE_PATH);
    
    // Convert to Base64
    console.log('Converting to Base64...');
    const base64 = audioFile.toString('base64');
    console.log(`Base64 string length: ${base64.length} characters`);
    
    // Calculate number of chunks needed
    const numChunks = Math.ceil(base64.length / CHUNK_SIZE);
    console.log(`Splitting into ${numChunks} chunks of ${CHUNK_SIZE} characters each`);
    
    // Split and write chunks
    console.log('Writing chunks...');
    
    if (USE_COMPRESSION) {
      console.log('Using compression for smaller file size...');
    }
    
    const chunkInfos = []; // Store information about each chunk for the decoder
    
    for (let i = 0; i < numChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, base64.length);
      let chunk = base64.substring(start, end);
      
      // Apply compression if enabled
      let compressedChunk = chunk;
      let compressionType = 'none';
      
      if (USE_COMPRESSION) {
        // Try different compression methods and use the best one
        
        // Method 1: Run-Length Encoding (good for repetitive sequences)
        const rleChunk = runLengthEncode(chunk);
        
        // Method 2: DEFLATE compression (via zlib)
        const deflatedChunk = zlib.deflateSync(chunk).toString('base64');
        
        // Choose the best compression method
        const originalSize = chunk.length;
        const rleSize = rleChunk.length;
        const deflatedSize = deflatedChunk.length;
        
        console.log(`Chunk ${i}: Original: ${originalSize}, RLE: ${rleSize}, DEFLATE: ${deflatedSize}`);
        
        if (rleSize < originalSize && rleSize <= deflatedSize) {
          compressedChunk = rleChunk;
          compressionType = 'rle';
          console.log(`  Using RLE compression: ${Math.round((1 - rleSize/originalSize) * 100)}% reduction`);
        } else if (deflatedSize < originalSize && deflatedSize < rleSize) {
          compressedChunk = deflatedChunk;
          compressionType = 'deflate';
          console.log(`  Using DEFLATE compression: ${Math.round((1 - deflatedSize/originalSize) * 100)}% reduction`);
        } else {
          console.log('  No compression used for this chunk (would increase size)');
        }
      }
      
      // Store chunk info
      chunkInfos.push({
        index: i,
        compressionType
      });
      
      // Write the chunk file
      const chunkPath = path.join(OUTPUT_DIR, `chunk${i}.js`);
      fs.writeFileSync(
        chunkPath,
        `/* eslint-disable */
export const compressionType = "${compressionType}";
export default "${compressedChunk}";
/* eslint-enable */`
      );
      console.log(`Created ${chunkPath}`);
    }
    
    // Create index file to recombine chunks with decompression logic
    console.log(`Creating index file at ${INDEX_FILE_PATH}...`);
    
    const importStatements = Array.from({ length: numChunks }, (_, i) => 
      `import chunk${i}, { compressionType as compressionType${i} } from './chunks/chunk${i}.js';`
    ).join('\n');
    
    // Create a decoder function within the index file
    const indexContent = `/* eslint-disable */
${importStatements}

// Decompression functions
function runLengthDecode(str) {
  let decoded = '';
  let i = 0;
  
  while (i < str.length) {
    // Check if current character is a digit
    let count = '';
    while (i < str.length && !isNaN(parseInt(str[i]))) {
      count += str[i];
      i++;
    }
    
    if (count !== '') {
      // We found a run-length encoded sequence
      const char = str[i];
      decoded += char.repeat(parseInt(count));
      i++;
    } else {
      // Regular character
      decoded += str[i];
      i++;
    }
  }
  
  return decoded;
}

function inflateBase64(base64Str) {
  try {
    // In browser environment, we need to convert base64 to ArrayBuffer first
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    // Use pako for inflation (you would need to include pako.min.js in your project)
    // If pako is not available, we can fall back to a simpler method or skip inflation
    if (typeof pako !== 'undefined') {
      const inflated = pako.inflate(bytes);
      return new TextDecoder().decode(inflated);
    } else {
      console.warn('Pako library not found. Using uncompressed data.');
      return base64Str;
    }
  } catch (e) {
    console.error('Error inflating data:', e);
    return base64Str;
  }
}

// Process each chunk with appropriate decompression
function processChunk(chunk, compressionType) {
  switch (compressionType) {
    case 'rle':
      return runLengthDecode(chunk);
    case 'deflate':
      try {
        return inflateBase64(chunk);
      } catch (e) {
        console.error('Failed to inflate chunk:', e);
        return chunk;
      }
    default:
      return chunk;
  }
}

// Combine all chunks with decompression as needed
const combinedBase64 = [
${Array.from({ length: numChunks }, (_, i) => `  processChunk(chunk${i}, compressionType${i})`).join(',\n')}
].join('');

export default combinedBase64;
/* eslint-enable */`;
    
    fs.writeFileSync(INDEX_FILE_PATH, indexContent);
    console.log('Done!');
    
    // Add a note about pako library if we used DEFLATE compression
    if (chunkInfos.some(info => info.compressionType === 'deflate')) {
      console.log('\nIMPORTANT: This implementation uses DEFLATE compression.');
      console.log('You need to include the pako library in your project:');
      console.log('1. Install pako: npm install pako');
      console.log('2. Add this to your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>');
      console.log('Or modify the index file to use a different decompression method.');
    }
    
  } catch (error) {
    console.error('Error processing audio file:', error);
  }
}

// Run the main function
processAudioFile();