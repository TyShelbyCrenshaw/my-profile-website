// chunkAudioFile.js
const fs = require('fs');
const path = require('path');

// Configuration
const AUDIO_FILE_PATH = './src/music/forever-live-sessions-vol-2-hq.mp3'; // Change to your audio file path
const OUTPUT_DIR = './src/music/chunks-2';
const CHUNK_SIZE = 50000; // Adjust based on your needs
const INDEX_FILE_PATH = './src/music/audioBase64.js';

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

// Create directory for chunks if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`Creating directory ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Split and write chunks
console.log('Writing chunks...');
for (let i = 0; i < numChunks; i++) {
  const start = i * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, base64.length);
  const chunk = base64.substring(start, end);
  
  const chunkPath = path.join(OUTPUT_DIR, `chunk${i}.js`);
  fs.writeFileSync(
    chunkPath,
    `/* eslint-disable */\nexport default "${chunk}";\n/* eslint-enable */`
  );
  console.log(`Created ${chunkPath}`);
}

// Create index file to recombine chunks
console.log(`Creating index file at ${INDEX_FILE_PATH}...`);
const importStatements = Array.from({ length: numChunks }, (_, i) => 
  `import chunk${i} from './chunks/chunk${i}.js';`
).join('\n');

const combineStatements = `/* eslint-disable */\n${importStatements}\n\nexport default ${
  Array.from({ length: numChunks }, (_, i) => `chunk${i}`).join(' + ')
};\n/* eslint-enable */`;

fs.writeFileSync(INDEX_FILE_PATH, combineStatements);
console.log('Done!');