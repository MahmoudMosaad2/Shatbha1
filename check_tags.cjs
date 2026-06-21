const fs = require('fs');

const code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');
const lines = code.split('\n');

const startLine = 11070;
const endLine = 11400;

console.log('Analyzing tags from line', startLine, 'to', endLine);

let stack = [];

for (let r = startLine; r <= endLine; r++) {
  const line = lines[r - 1]; // 1-indexed
  if (!line) continue;
  
  // Find all JSX/HTML tags
  const matches = line.matchAll(/<(\/?)([A-Za-z0-9.:_-]+)(?:\s+[^>]*?)?(\/?)>/g);
  for (const m of matches) {
    const isClosing = m[1] === '/';
    const tagName = m[2];
    const isSelfClosing = m[3] === '/' || ['input', 'img', 'br', 'hr'].includes(tagName.toLowerCase());
    
    if (isSelfClosing) continue;
    
    if (isClosing) {
      if (stack.length === 0) {
        console.log(`L${r}: Extra closing tag </${tagName}>. Line: ${line.trim()}`);
      } else {
        const popped = stack.pop();
        if (popped.tagName !== tagName) {
          console.log(`L${r}: Mismatch! Closing </${tagName}> but expected </${popped.tagName}> (opened at L${popped.r}). Line: ${line.trim()}`);
        }
      }
    } else {
      stack.push({ tagName, r, lineText: line.trim() });
    }
  }
}

console.log('\nRemaining open tags at line', endLine, ':', stack.length);
stack.forEach(s => {
  console.log(`- <${s.tagName}> opened at line ${s.r}`);
});
