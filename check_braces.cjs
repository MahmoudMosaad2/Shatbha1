const fs = require('fs');

const code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Parse parentheses, curly braces and braces and track current line and position
let line = 1;
let col = 1;
let stack = [];

// Avoid counting braces inside string literals or comments
let inSingleQuote = false;
let inDoubleQuote = false;
let inTemplateLiteral = false;
let inLineComment = false;
let inBlockComment = false;

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  const nextChar = code[i+1];
  
  if (char === '\n') {
    line++;
    col = 1;
    inLineComment = false;
  } else {
    col++;
  }
  
  if (inLineComment) {
    continue;
  }
  if (inBlockComment) {
    if (char === '*' && nextChar === '/') {
      inBlockComment = false;
      i++; col++;
    }
    continue;
  }
  if (inSingleQuote) {
    if (char === "'" && code[i-1] !== '\\') {
      inSingleQuote = false;
    }
    continue;
  }
  if (inDoubleQuote) {
    if (char === '"' && code[i-1] !== '\\') {
      inDoubleQuote = false;
    }
    continue;
  }
  if (inTemplateLiteral) {
    if (char === '`' && code[i-1] !== '\\' && (code[i-1] !== '$' || code[i-2] !== '{')) {
      inTemplateLiteral = false;
    }
    continue;
  }
  
  // Check comment openers
  if (char === '/' && nextChar === '/') {
    inLineComment = true;
    i++; col++;
    continue;
  }
  if (char === '/' && nextChar === '*') {
    inBlockComment = true;
    i++; col++;
    continue;
  }
  
  // Check string openers
  if (char === "'") { inSingleQuote = true; continue; }
  if (char === '"') { inDoubleQuote = true; continue; }
  if (char === '`') { inTemplateLiteral = true; continue; }
  
  // Track parentheses, brackets, braces
  if (char === '(' || char === '{' || char === '[') {
    stack.push({ char, line, col });
  } else if (char === ')' || char === '}' || char === ']') {
    const opp = char === ')' ? '(' : char === '}' ? '{' : '[';
    if (stack.length === 0) {
      console.log(`Extra closing char ${char} at line ${line}, col ${col}`);
    } else {
      const top = stack.pop();
      if (top.char !== opp) {
        console.log(`Mismatch: found closing ${char} at line ${line}, col ${col} matching opening ${top.char} from line ${top.line}, col ${top.col}`);
      }
    }
  }
}

console.log('Finished scanner. Number of unclosed tokens in stack:', stack.length);
if (stack.length > 0) {
  console.log('Unclosed tokens (up to 20):');
  for (let k = Math.max(0, stack.length - 20); k < stack.length; k++) {
    console.log(`${stack[k].char} opened at line ${stack[k].line}, col ${stack[k].col}`);
  }
}
