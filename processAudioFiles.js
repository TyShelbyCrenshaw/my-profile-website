// processAudioFiles.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Configuration
const MUSIC_DIR = './src/music'; // Directory containing MP3 files
const OUTPUT_DIR = './src/music/processed'; // Where to store processed files
const CHUNK_SIZE = 50000; // Size of each chunk
const INDEX_FILE_PATH = './src/music/audioIndex.js'; // The main index file that will export all audio
const TRACK_INFO_PATH = './src/music/trackInfo.js'; // File that will contain track metadata

// Create required directories if they don't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`Creating directory ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Process a single audio file
async function processAudioFile(filePath, fileName) {
  const trackId = path.basename(fileName, path.extname(fileName));
  const sanitizedTrackId = trackId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  console.log(`\nProcessing file: ${fileName} (ID: ${sanitizedTrackId})`);
  
  // Create a directory for this track
  const trackDir = path.join(OUTPUT_DIR, sanitizedTrackId);
  if (!fs.existsSync(trackDir)) {
    fs.mkdirSync(trackDir, { recursive: true });
  }
  
  try {
    // Read the audio file
    console.log(`Reading audio file from ${filePath}...`);
    const audioFile = fs.readFileSync(filePath);
    
    // Convert to Base64
    console.log('Converting to Base64...');
    const base64 = audioFile.toString('base64');
    console.log(`Base64 string length: ${base64.length} characters`);
    
    // Calculate number of chunks needed
    const numChunks = Math.ceil(base64.length / CHUNK_SIZE);
    console.log(`Splitting into ${numChunks} chunks of ${CHUNK_SIZE} characters each`);
    
    // Split and write chunks
    console.log('Writing chunks...');
    
    const chunkInfos = []; // Store information about each chunk
    
    for (let i = 0; i < numChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, base64.length);
      let chunk = base64.substring(start, end);
      
      // We'll only use DEFLATE compression or no compression
      // to avoid the RLE decoding issues
      let compressedChunk = chunk;
      let compressionType = 'none';
      
      // Only try DEFLATE compression
      try {
        const deflatedChunk = zlib.deflateSync(chunk).toString('base64');
        
        // Choose the best compression method
        const originalSize = chunk.length;
        const deflatedSize = deflatedChunk.length;
        
        console.log(`Chunk ${i}: Original: ${originalSize}, DEFLATE: ${deflatedSize}`);
        
        if (deflatedSize < originalSize) {
          compressedChunk = deflatedChunk;
          compressionType = 'deflate';
          console.log(`  Using DEFLATE compression: ${Math.round((1 - deflatedSize/originalSize) * 100)}% reduction`);
        } else {
          console.log('  No compression used for this chunk (would increase size)');
        }
      } catch (e) {
        console.error('Error during compression, using uncompressed chunk:', e.message);
      }
      
      // Store chunk info
      chunkInfos.push({
        index: i,
        compressionType
      });
      
      // Write the chunk file
      const chunkPath = path.join(trackDir, `chunk${i}.js`);
      fs.writeFileSync(
        chunkPath,
        `/* eslint-disable */
export const compressionType = "${compressionType}";
export default "${compressedChunk}";
/* eslint-enable */`
      );
    }
    
    // Create track index file
    const trackIndexPath = path.join(trackDir, 'index.js');
    
    const importStatements = Array.from({ length: numChunks }, (_, i) => 
      `import chunk${i}, { compressionType as compressionType${i} } from './chunk${i}.js';`
    ).join('\n');
    
    const trackIndexContent = `/* eslint-disable */
${importStatements}

// Decompression functions
function inflateBase64(base64Str) {
  // This function assumes you've included pako from CDN in your HTML
  try {
    if (!base64Str || typeof base64Str !== 'string') {
      console.error('Invalid input to inflateBase64:', base64Str);
      return '';
    }
    
    // In browser environment, we need to convert base64 to ArrayBuffer first
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    // Use pako for inflation
    if (typeof pako !== 'undefined') {
      try {
        const inflated = pako.inflate(bytes);
        return new TextDecoder().decode(inflated);
      } catch (e) {
        console.error('Pako inflation error:', e);
        return base64Str;
      }
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
    case 'deflate':
      return inflateBase64(chunk);
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
    
    fs.writeFileSync(trackIndexPath, trackIndexContent);
    console.log(`Created track index file: ${trackIndexPath}`);
    
    // Return information about this track
    return {
      id: sanitizedTrackId,
      fileName: fileName,
      title: prettifyTitle(trackId),
      chunks: numChunks,
      originalSize: audioFile.length,
      base64Size: base64.length
    };
    
  } catch (error) {
    console.error(`Error processing audio file ${fileName}:`, error);
    return null;
  }
}

// Convert file names to prettier titles
function prettifyTitle(fileName) {
  return fileName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Mp3$/, '')
    .trim();
}

// Main function to process all audio files
async function processAllAudioFiles() {
  console.log('Scanning for MP3 files...');
  
  // Get all MP3 files in the music directory
  const files = fs.readdirSync(MUSIC_DIR)
    .filter(file => file.toLowerCase().endsWith('.mp3'));
  
  if (files.length === 0) {
    console.log('No MP3 files found.');
    return;
  }
  
  console.log(`Found ${files.length} MP3 files: ${files.join(', ')}`);
  
  // Process each file
  const processedTracks = [];
  
  for (const file of files) {
    const filePath = path.join(MUSIC_DIR, file);
    const trackInfo = await processAudioFile(filePath, file);
    
    if (trackInfo) {
      processedTracks.push(trackInfo);
    }
  }
  
  // Create the main index file that exports all tracks
  console.log('\nCreating main index file...');
  
  const mainIndexContent = `/* eslint-disable */
${processedTracks.map(track => 
  `import ${track.id} from './processed/${track.id}/index.js';`
).join('\n')}

// Export all tracks
export default {
${processedTracks.map(track => 
  `  ${track.id}`
).join(',\n')}
};
/* eslint-enable */`;
  
  fs.writeFileSync(INDEX_FILE_PATH, mainIndexContent);
  console.log(`Created main index file: ${INDEX_FILE_PATH}`);
  
  // Create track info file with metadata for the player
  console.log('Creating track info file...');
  
  const trackInfoContent = `/* eslint-disable */
// Auto-generated track information
export default [
${processedTracks.map(track => `  {
    id: "${track.id}",
    title: "${track.title}",
    fileName: "${track.fileName}",
    artist: "Unknown" // You may want to extract this from ID3 tags in the future
  }`).join(',\n')}
];
/* eslint-enable */`;
  
  fs.writeFileSync(TRACK_INFO_PATH, trackInfoContent);
  console.log(`Created track info file: ${TRACK_INFO_PATH}`);
  
  console.log('\nProcessing complete!');
  console.log(`Processed ${processedTracks.length} audio files.`);
  console.log('\nIMPORTANT: This implementation uses DEFLATE compression.');
  console.log('Make sure you have the pako library in your index.html:');
  console.log('<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>');
}

// Run the main function
processAllAudioFiles();