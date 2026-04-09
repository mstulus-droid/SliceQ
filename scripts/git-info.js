const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
    const date = execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    
    return { hash, message, date, branch };
  } catch (error) {
    console.warn('Could not get git info:', error.message);
    return { 
      hash: 'unknown', 
      message: 'No commit info available', 
      date: new Date().toISOString(),
      branch: 'unknown'
    };
  }
}

const gitInfo = getGitInfo();
const content = `export const GIT_INFO = ${JSON.stringify(gitInfo, null, 2)};\n`;

const outputPath = path.join(__dirname, '..', 'src', 'lib', 'git-info.ts');
fs.writeFileSync(outputPath, content, 'utf-8');

console.log('Git info generated:', gitInfo.hash);
