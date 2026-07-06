const { execSync } = require('child_process');

try {
  console.log('Starting auto upload to GitHub...');
  
  // Check git status
  const status = execSync('git status --porcelain').toString().trim();
  if (!status) {
    console.log('No changes to upload.');
    process.exit(0);
  }

  // Git Add
  console.log('Adding files...');
  execSync('git add .');

  // Git Commit
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const commitMsg = `Auto-update Cineaho - ${timestamp}`;
  console.log(`Committing changes: "${commitMsg}"...`);
  // Escape quotes in commit message
  const escapedMsg = commitMsg.replace(/"/g, '\\"');
  execSync(`git commit -m "${escapedMsg}"`);

  // Git Push
  console.log('Pushing to GitHub...');
  execSync('git push -u origin main');
  
  console.log('Upload completed successfully!');
} catch (error) {
  console.error('Error during upload:', error.stdout ? error.stdout.toString() : error.message);
  process.exit(1);
}
