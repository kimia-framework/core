import * as FS from 'fs';
import * as PATH from 'path';

export async function copyDirectory(path: string, newPath: string, excludeFiles?: string[], excludeDirs?: string[]) {
   // =>create new directory
   FS.mkdirSync(newPath, { recursive: true });
   // =>list all files, dirs in path
   const files = FS.readdirSync(path, { withFileTypes: true });
   for (const f of files) {
      // =>if file
      if (f.isFile()) {
         // =>check not in exclude files
         if (excludeFiles && excludeFiles.includes(f.name)) continue;
         // =>add file
         FS.copyFileSync(PATH.join(path, f.name), PATH.join(newPath, f.name));
      }
      //=> if dir
      if (f.isDirectory()) {
         // =>check not in exclude dirs
         if (excludeDirs && excludeDirs.includes(f.name)) continue;
         // =>add folder
         FS.mkdirSync(PATH.join(newPath, f.name), { recursive: true });
         await copyDirectory(PATH.join(path, f.name), PATH.join(newPath, f.name));
      }
   }
   return true;
}