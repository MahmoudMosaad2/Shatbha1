const fs = require('fs');
const { execSync } = require('child_process');

const filePath = 'src/components/AdminDashboardView.tsx';
const originalContent = fs.readFileSync(filePath, 'utf8');

// 1. First insert the wrapper open divs for the stepper
const anchor = 'Active filled line depending on step';
const anchorIdx = originalContent.indexOf(anchor);

if (anchorIdx === -1) {
  console.log('Could not find anchor!');
  process.exit(1);
}

const divIdx = originalContent.indexOf('<div', anchorIdx);
if (divIdx === -1) {
  console.log('Could not find <div after anchor!');
  process.exit(1);
}

const contentWithOpeners = originalContent.slice(0, divIdx) + 
  `<div className="relative mt-8 mb-10 px-4">
                                  <div className="relative flex items-center justify-between">
                                    ` + 
  originalContent.slice(divIdx);

// 2. Now find the `{false && (` block start
const blockStartStr = '{/* STANDARD CONFIG FOR NON-FINISHED STATUS - REMOVED PER USER INSTRUCTION */}';
const blockStartIdx = contentWithOpeners.indexOf(blockStartStr);

if (blockStartIdx === -1) {
  console.log('Could not find false block start!');
  process.exit(1);
}

// Locate the direct launch button
const directLaunch = 'إطلاق مباشر دون المرور بالمشرف ⚡';
const launchIdx = contentWithOpeners.indexOf(directLaunch);

if (launchIdx === -1) {
  console.log('Could not find launch button!');
  process.exit(1);
}

const closeBtnIdx = contentWithOpeners.indexOf('</button>', launchIdx);
const endFragIdx = contentWithOpeners.indexOf('</React.Fragment>', closeBtnIdx);

if (closeBtnIdx === -1 || endFragIdx === -1) {
  console.log('Could not find close button or fragment!');
  process.exit(1);
}

// Slice out the entire false block!
const beforeFalseBlock = contentWithOpeners.slice(0, blockStartIdx);
const afterFragment = contentWithOpeners.slice(endFragIdx + '</React.Fragment>'.length);

const replacement = `{/* Removing the false && block entirely */}
                                </div> {/* closes bg-[#FAFBFB] (11078) */}
                              </div> {/* closes space-y-4 (11076) */}
                            )}
                          </div> {/* closes white card (10519) */}
                        </td> {/* closes td (10518) */}
                      </tr> {/* closes tr (10517) */}
                    )}
                  </React.Fragment>`;

const testContent = beforeFalseBlock + replacement + afterFragment;
fs.writeFileSync(filePath, testContent, 'utf8');

console.log('Deleted false block and added correct ternary closing. Running TypeScript compilation...');

try {
  const stdout = execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log('WOW!!! Compilation succeeded perfectly with ZERO errors!');
  
  // Keep the working compiled code!
  fs.writeFileSync('src/components/AdminDashboardView.tsx', testContent, 'utf8');
  process.exit(0);
} catch (err) {
  console.log('Errors occurred:');
  const lines = err.stdout.split('\n').filter(l => l.includes('AdminDashboardView.tsx'));
  lines.slice(0, 15).forEach(l => console.log('  ', l));
  
  // Restore original
  fs.writeFileSync(filePath, originalContent, 'utf8');
}
