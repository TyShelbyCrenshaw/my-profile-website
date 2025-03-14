// convertAudioToBase64.js
const fs = require('fs');

// Read the audio file
const audioFile = fs.readFileSync('./src/music/bang-crash-103775.mp3');

// Convert to Base64
const base64 = audioFile.toString('base64');

// Write to a JavaScript file
fs.writeFileSync(
  './src/audioBase64.js',
  `export default "${base64}";`
);