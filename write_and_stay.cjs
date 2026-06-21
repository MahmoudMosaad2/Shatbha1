const fs = require('fs');

const filePath = 'src/components/AdminDashboardView.tsx';
const originalContent = fs.readFileSync(filePath, 'utf8');

// 1. First insert the wrapper open divs for the stepper
const anchor = 'Active filled line depending on step';
const anchorIdx = originalContent.indexOf(anchor);

const divIdx = originalContent.indexOf('<div', anchorIdx);

const contentWithOpeners = originalContent.slice(0, divIdx) + 
  `<div className="relative mt-8 mb-10 px-4">
                                  <div className="relative flex items-center justify-between">
                                    ` + 
  originalContent.slice(divIdx);

// 2. Now find the `{false && (` block start
const blockStartStr = '{/* STANDARD CONFIG FOR NON-FINISHED STATUS - REMOVED PER USER INSTRUCTION */}';
const blockStartIdx = contentWithOpeners.indexOf(blockStartStr);

const directLaunch = 'إطلاق مباشر دون المرور بالمشرف ⚡';
const launchIdx = contentWithOpeners.indexOf(directLaunch);

const closeBtnIdx = contentWithOpeners.indexOf('</button>', launchIdx);
const endFragIdx = contentWithOpeners.indexOf('</React.Fragment>', closeBtnIdx);

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

console.log('Written successfully! Now viewing lines 12065 to 12100 in the written file:');
const lines = testContent.split('\n');
for (let i = 12065; i <= 12100; i++) {
  if (lines[i-1]) {
    console.log(`${i}: ${lines[i-1]}`);
  }
}
