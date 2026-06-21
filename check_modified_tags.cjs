const fs = require('fs');

const code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const lines = code.split('\n');
let openTags = [];
let re = /<\/?([a-zA-Z0-9\:\.]+)(?:\s+[^>]*?)?(\/?)>/g;

// Analyze range from 11075 to 12100
for (let i = 11070; i <= 12100; i++) {
  const line = lines[i-1];
  if (!line) continue;
  
  // Wipe comments and strings to make regex robust
  let clean = line.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
                  .replace(/"[^"]*?"/g, '""')
                  .replace(/'[^']*?'/g, "''")
                  .replace(/`[\s\S]*?`/g, "``");
                  
  let match;
  while ((match = re.exec(clean)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const isSelfClosing = match[2] === '/' || fullTag.endsWith('/>');
    const isClosing = fullTag.startsWith('</');
    
    // Ignore simple native tags like input, br, img that might be written self-closing
    if (['input', 'br', 'img', 'hr'].includes(tagName)) continue;
    
    if (isSelfClosing) {
      continue;
    }
    
    if (isClosing) {
      if (openTags.length > 0) {
        const top = openTags.pop();
        if (top.tagName !== tagName) {
          console.log(`L${i}: Mismatch! Closed </${tagName}> but expected </${top.tagName}> (opened at L${top.line})`);
        }
      } else {
        console.log(`L${i}: Extra closing tag </${tagName}>.`);
      }
    } else {
      openTags.push({ tagName, line: i });
    }
  }
}

console.log('\nRemaining open tags in range:');
openTags.forEach(t => console.log(`- <${t.tagName}> opened at L${t.line}`));
