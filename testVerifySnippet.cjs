const fs = require('fs');
const { execSync } = require('child_process');

const filePath = 'src/components/AdminDashboardView.tsx';
const originalContent = fs.readFileSync(filePath, 'utf8');

const directLaunch = 'إطلاق مباشر دون المرور بالمشرف ⚡';
const index = originalContent.indexOf(directLaunch);

if (index === -1) {
  console.log('Could not find launch button label!');
  process.exit(1);
}

// Find '</button>'
const closeBtnIdx = originalContent.indexOf('</button>', index);
const endFragIdx = originalContent.indexOf('</React.Fragment>', closeBtnIdx);

if (closeBtnIdx === -1 || endFragIdx === -1) {
  console.log('Could not locate button or fragment!');
  process.exit(1);
}

const beforeButton = originalContent.slice(0, closeBtnIdx);
const afterFragment = originalContent.slice(endFragIdx);

// Let's try some variations of closing tags!
const variations = [
  {
    name: "Standard balanced block with compact )}",
    tpl: `</button>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>`
  },
  {
    name: "Standard balanced block with unified )}",
    tpl: `</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>`
  },
  {
    name: "Classic JSX matching block",
    tpl: `</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>`
  }
];

for (const variation of variations) {
  console.log('\n--- Testing variation:', variation.name);
  const testContent = beforeButton + variation.tpl + afterFragment;
  fs.writeFileSync(filePath, testContent, 'utf8');
  
  try {
    const stdout = execSync('npx tsc --noEmit', { encoding: 'utf8' });
    console.log('Success! No errors!');
    process.exit(0);
  } catch (err) {
    console.log('Failed with some errors. Let us see if our section has errors:');
    const lines = err.stdout.split('\n').filter(l => l.includes('AdminDashboardView.tsx'));
    // Print first 5 errors
    lines.slice(0, 8).forEach(l => console.log('  ', l));
  }
}

// Restore original
fs.writeFileSync(filePath, originalContent, 'utf8');
