const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const defaultBackupDir = 'G:\\My Drive\\Company Data\\GTD_terminal\\local_Value_Investing_Terminal';

function createBackup(resolvedDir = defaultBackupDir) {
  console.log('Starting backup to: ' + resolvedDir);

  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const zipFileName = `Value-Investing-Terminal_backup_${timestamp}.zip`;
  const targetZipPath = path.join(resolvedDir, zipFileName);

  const zip = new AdmZip();
  const excludeDirs = new Set(['node_modules', '.git', 'backups', '.antigravity', 'dist']);

  function addFolder(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!excludeDirs.has(item)) {
          addFolder(fullPath, path.join(relativePath, item));
        }
      } else {
        zip.addLocalFile(fullPath, relativePath);
      }
    }
  }

  console.log('Packaging source code, configs, .env files, and master prompts...');
  addFolder(projectRoot);

  console.log('Writing archive to Google Drive: ' + targetZipPath);
  zip.writeZip(targetZipPath);

  const stats = fs.statSync(targetZipPath);
  const mbSize = (stats.size / 1024).toFixed(1);
  console.log(`[SUCCESS] Backup finished! Size: ${mbSize} KB`);
  return targetZipPath;
}

if (require.main === module) {
  createBackup();
}

module.exports = { createBackup, defaultBackupDir };