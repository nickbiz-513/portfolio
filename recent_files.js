import fs from 'fs';
import path from 'path';

const now = Date.now();
const oneDayAgo = now - 24 * 60 * 60 * 1000;

function checkDir(dir, depth = 0) {
  if (depth > 5) return;
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (['proc', 'sys', 'dev', 'lib', 'lib64', 'node_modules', '.git', 'var', 'usr', 'etc', 'boot', 'run', 'node-compile-cache'].includes(file)) continue;
      const fullPath = path.join(dir, file);
      if (fullPath.includes('node-compile-cache')) continue;
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          checkDir(fullPath, depth + 1);
        } else {
          // If modified in last 24h, skip our build files
          if (stat.mtimeMs > oneDayAgo && 
              !file.includes('list_all_files') && 
              !file.includes('find_all_pngs') && 
              !file.includes('check_input_files') && 
              !file.includes('check_tmp') && 
              !file.includes('list_app') && 
              !file.includes('recent_files') && 
              !file.includes('print_env') &&
              !fullPath.includes('/dist/')) {
            console.log(`RECENT FILE: ${fullPath} (${stat.size} bytes) - Modified: ${stat.mtime}`);
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log("Searching for real recent files (excluding cache and node_modules)...");
checkDir('/');
console.log("Done checking.");
