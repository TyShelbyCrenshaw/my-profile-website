/* eslint-disable */
import chunk0, { compressionType as compressionType0 } from './chunk0.js';
import chunk1, { compressionType as compressionType1 } from './chunk1.js';

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
  processChunk(chunk0, compressionType0),
  processChunk(chunk1, compressionType1)
].join('');

export default combinedBase64;
/* eslint-enable */