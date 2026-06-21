const fs = require('fs');

const code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');
const lines = code.split('\n');

const anchor = 'إطلاق مباشر دون المرور بالمشرف';
const idx = code.indexOf(anchor);
if (idx !== -1) {
  // Find where it resides in lines
  let charCount = 0;
  let targetLine = 0;
  for (let s = 0; s < lines.length; s++) {
    charCount += lines[s].length + 1;
    if (charCount >= idx) {
      targetLine = s + 1;
      break;
    }
  }
  
  console.log('Found launch button on line:', targetLine);
  console.log('Showing lines:', targetLine - 5, 'to', targetLine + 25);
  for (let r = targetLine - 5; r <= targetLine + 25; r++) {
    if (lines[r-1]) {
      console.log(`${r}: ${lines[r-1]}`);
    }
  }
} else {
  console.log('Anchor not found!');
}
