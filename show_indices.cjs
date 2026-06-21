const fs = require('fs');
const code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const anchor = 'Active filled line depending on step';
const anchorIdx = code.indexOf(anchor);
const divIdx = code.indexOf('<div', anchorIdx);
const contentWithOpeners = code.slice(0, divIdx) + 
  `<div className="relative mt-8 mb-10 px-4">
                                  <div className="relative flex items-center justify-between">
                                    ` + 
  code.slice(divIdx);

const directLaunch = 'إطلاق مباشر دون المرور بالمشرف ⚡';
const launchIdx = contentWithOpeners.indexOf(directLaunch);
const closeBtnIdx = contentWithOpeners.indexOf('</button>', launchIdx);
const endFragIdx = contentWithOpeners.indexOf('</React.Fragment>', closeBtnIdx);

console.log('--- CONTENT BETWEEN BUTTON AND FRAGMENT:');
console.log(contentWithOpeners.slice(closeBtnIdx + '</button>'.length, endFragIdx));
