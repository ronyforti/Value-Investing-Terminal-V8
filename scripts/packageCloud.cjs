const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const gDriveCloudDir = 'G:\\My Drive\\Company Data\\GTD_terminal\\Forti Cap Val Investing Terminal';
const localBackupDir = path.join(projectRoot, 'backups');

function packageCloud() {
  const isGDriveAvailable = fs.existsSync(gDriveCloudDir);
  const targetDir = isGDriveAvailable ? gDriveCloudDir : localBackupDir;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const y = String(now.getFullYear()).slice(-2);
  const dateTag = `${m}-${d}-${y}`;
  const zipName = `value-investing-terminal-cloud-AiStudio-updated-${dateTag}.zip`;
  const targetPath = path.join(targetDir, zipName);

  console.log('Packaging AI Studio Cloud bundle to: ' + targetPath);

  const zip = new AdmZip();
  const excludeDirs = new Set(['node_modules', '.git', 'dist', 'backups', '.antigravity', 'tmp', 'staging', 'dossiers', '.gemini']);
  const excludeFiles = new Set(['.env.local', 'App.tsx.bak', 'server.ts.bak', 'test_sec.js', 'test-chart.js']);

  function addFolder(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (excludeDirs.has(item) || excludeFiles.has(item)) continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addFolder(fullPath, path.join(relativePath, item));
      } else {
        zip.addLocalFile(fullPath, relativePath);
      }
    }
  }

  addFolder(projectRoot);
  zip.writeZip(targetPath);

  // Also keep a local copy in backups
  if (isGDriveAvailable) {
    if (!fs.existsSync(localBackupDir)) {
      fs.mkdirSync(localBackupDir, { recursive: true });
    }
    const localCopy = path.join(localBackupDir, zipName);
    fs.copyFileSync(targetPath, localCopy);
    console.log('Local mirror copy saved to: ' + localCopy);
  }

  const stats = fs.statSync(targetPath);
  const kbSize = (stats.size / 1024).toFixed(1);
  console.log(`[SUCCESS] AI Studio Cloud package created! Size: ${kbSize} KB`);
  console.log('Location: ' + targetPath);
  return targetPath;
}

if (require.main === module) {
  packageCloud();
}

module.exports = { packageCloud };
