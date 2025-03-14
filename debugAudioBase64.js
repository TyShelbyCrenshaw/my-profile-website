// debugAudioBase64.js
const fs = require('fs');
const path = require('path');

// Path to your audioBase64.js file
const audioBase64Path = './src/music/audioBase64.js';

try {
  // Read the file
  console.log(`Reading file from ${audioBase64Path}...`);
  const fileContent = fs.readFileSync(audioBase64Path, 'utf8');
  
  console.log(`File size: ${fileContent.length} characters`);
  
  // Check if the file starts with import statements (chunked version)
  const hasImports = fileContent.trim().startsWith('import');
  console.log(`File contains import statements: ${hasImports}`);
  
  if (hasImports) {
    // Count the number of import statements
    const importCount = (fileContent.match(/import/g) || []).length;
    console.log(`Number of imports: ${importCount}`);
    
    // Check export statement
    const hasExport = fileContent.includes('export default');
    console.log(`File contains export statement: ${hasExport}`);
  } else {
    // It's a direct Base64 export
    // Extract the Base64 string
    const exportMatch = fileContent.match(/export default\s+["']([^"']+)["']/);
    if (exportMatch && exportMatch[1]) {
      const base64String = exportMatch[1];
      console.log(`Base64 string length: ${base64String.length}`);
      console.log(`First 50 chars: ${base64String.substring(0, 50)}`);
      console.log(`Last 50 chars: ${base64String.substring(base64String.length - 50)}`);
      
      // Check for common Base64 issues
      const validBase64Pattern = /^[A-Za-z0-9+/=]+$/;
      const isValidBase64 = validBase64Pattern.test(base64String);
      console.log(`Contains only valid Base64 characters: ${isValidBase64}`);
      
      // If not valid, find what's wrong
      if (!isValidBase64) {
        const invalidChars = base64String.match(/[^A-Za-z0-9+/=]/g);
        console.log(`Invalid characters found: ${JSON.stringify([...new Set(invalidChars)])}`);
        
        // Find positions of invalid characters
        let positions = [];
        for (let i = 0; i < base64String.length; i++) {
          if (!/[A-Za-z0-9+/=]/.test(base64String[i])) {
            positions.push({
              position: i,
              char: base64String[i],
              context: base64String.substring(Math.max(0, i-10), Math.min(base64String.length, i+10))
            });
            if (positions.length >= 5) break;
          }
        }
        console.log("First few invalid characters with context:");
        console.log(positions);
      }
      
      // Check if length is divisible by 4 (required for valid Base64)
      console.log(`Length divisible by 4: ${base64String.length % 4 === 0}`);
      
      // Check for common errors with concatenation
      if (base64String.includes('""') || base64String.includes("''")) {
        console.log("Warning: Found string concatenation issues!");
      }
    } else {
      console.log("Could not extract Base64 string from file!");
      console.log("First 200 chars of file:", fileContent.substring(0, 200));
    }
  }
  
  // Give advice based on the analysis
  console.log("\n--- Recommendations ---");
  if (hasImports) {
    console.log("File appears to be using the chunking approach with imports.");
    console.log("Make sure your base64ToBlob function is handling the concatenated string correctly.");
    console.log("Check for any string concatenation issues between chunks.");
  } else {
    console.log("File appears to be using a direct Base64 export.");
    console.log("Make sure the Base64 string is properly formatted and doesn't contain invalid characters.");
  }
  
  console.log("\nIf you continue having issues, consider:\n" +
              "1. Using a direct data URL in your code\n" +
              "2. Hosting the audio file on your server instead of embedding it\n" +
              "3. Using a different audio format (like Ogg or AAC) which might be smaller");
  
} catch (error) {
  console.error("Error reading/processing file:", error);
}