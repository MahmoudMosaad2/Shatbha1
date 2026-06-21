const fs = require('fs');
const { execSync } = require('child_process');

const filePath = 'src/components/AdminDashboardView.tsx';
const originalContent = fs.readFileSync(filePath, 'utf8');

const anchor = 'Active filled line depending on step';
const idx = originalContent.indexOf(anchor);

if (idx === -1) {
  console.log('Could not find anchor!');
  process.exit(1);
}

// Locate the '<div' target after anchor
const divIdx = originalContent.indexOf('<div', idx);
if (divIdx === -1) {
  console.log('Could not find <div after anchor!');
  process.exit(1);
}

const beforeDiv = originalContent.slice(0, divIdx);
const afterDiv = originalContent.slice(divIdx);

const wrapperOpen = `<div className="relative mt-8 mb-10 px-4">
                                  <div className="relative flex items-center justify-between">
                                    `;

const testContent = beforeDiv + wrapperOpen + afterDiv;

console.log('Writing test content around anchor...');
fs.writeFileSync(filePath, testContent, 'utf8');

try {
  const stdout = execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log('WOW! Success! No errors parsed!');
  process.exit(0);
} catch (err) {
  console.log('Errors:');
  const lines = err.stdout.split('\n').filter(l => l.includes('AdminDashboardView.tsx'));
  lines.slice(0, 10).forEach(l => console.log('  ', l));
}

// Restore original
fs.writeFileSync(filePath, originalContent, 'utf8');
