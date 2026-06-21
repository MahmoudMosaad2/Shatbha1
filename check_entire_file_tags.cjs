const fs = require('fs');

const code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');
const lines = code.split('\n');

console.log('Analyzing entire file tags...');

let stack = [];

for (let r = 1; r <= lines.length; r++) {
  const line = lines[r - 1];
  if (!line) continue;
  
  // Exclude comments, script segments or text content to find tag patterns
  let lineCleared = line;
  
  // Find tags
  const matches = lineCleared.matchAll(/<(\/?)([A-Za-z0-9.:_-]+)(?:\s+[^>]*?)?(\/?)>/g);
  for (const m of matches) {
    const isClosing = m[1] === '/';
    const tagName = m[2];
    const isSelfClosing = m[3] === '/' || ['input', 'img', 'br', 'hr'].includes(tagName.toLowerCase());
    
    if (isSelfClosing) continue;
    
    if (isClosing) {
      if (stack.length === 0) {
        // console.log(`L${r}: Extra closing tag </${tagName}>.`);
      } else {
        const popped = stack.pop();
        if (popped.tagName !== tagName) {
          // Track nesting deviations
          // console.log(`L${r}: Mismatch! Closing </${tagName}> but expected </${popped.tagName}> opened at L${popped.r}`);
        }
      }
    } else {
      stack.push({ tagName, r });
    }
  }
}

console.log('Finished. Remaining unclosed tags at the end of the entire file:', stack.length);
if (stack.length > 0) {
  console.log('Unclosed tags at end of file (up to 40):');
  for (let k = Math.max(0, stack.length - 40); k < stack.length; k++) {
    console.log(`- <${stack[k].tagName}> opened at line ${stack[k].r}`);
  }
}
