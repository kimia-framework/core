import { Plugin } from "./plugin";
import * as FS from 'fs';
import * as PATH from 'path';

export interface NodeMailerConfig {
   host?: string;
   service?: string;
   port?: number;
   secure?: boolean; // true for 465, false for other ports
   auth: {
      user: string,
      pass: string;
   };
}


export class JSZip extends Plugin<NodeMailerConfig> {
   transporter;
   version = 3;
   /**************************************** */
   async init() {
      return true;
   }
   /**************************************** */
   async checkRequirements() {
      try {
         var jszip = require('jszip');
         return true;
      } catch (e) {
         return false;
      }
   }
   /**************************************** */
   async setConfig(config: NodeMailerConfig) {
      // var nodemailer = require('nodemailer');
      // this.config = config;
      // this.transporter = nodemailer.createTransport(config);
      return true;
   }
   /**************************************** */
   requirementsInfo() {
      return `install 'jszip' package by 'npm i jszip --save'`;
   }
   /**************************************** */
   async createZipFile(path: string, newPath: string, excludeFiles?: string[], excludeDirs?: string[]) {
      var jszip = require('jszip');
      const zip = new jszip();
      const addZip = (path: string, zipPath: string) => {
         const files = FS.readdirSync(path, { withFileTypes: true });
         for (const f of files) {
            // =>if file
            if (f.isFile()) {
               // =>check not in exclude files
               if (excludeFiles && excludeFiles.includes(f.name)) continue;
               // =>add file
               zip.file(PATH.join(zipPath, f.name), FS.readFileSync(PATH.join(path, f.name)));
            }
            //=> if dir
            if (f.isDirectory()) {
               // =>check not in exclude dirs
               if (excludeDirs && excludeDirs.includes(f.name)) continue;
               // =>add folder
               zip.folder(PATH.join(zipPath, f.name));
               addZip(PATH.join(path, f.name), PATH.join(zipPath, f.name));
            }
         }
      }
      // =>add files to zip
      addZip(path, '');
      // =>create zip file
      return new Promise((res) => {
         zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(FS.createWriteStream(newPath))
            .on('finish', () => {
               // JSZip generates a readable stream with a "end" event,
               // but is piped here in a writable stream which emits a "finish" event.
               this.infoLog('create a zip file in :' + newPath);
               res(newPath);
            });
      });
   }
   /**************************************** */
   async extractZipFile(path: string, extractPath: string) {
      var jszip = require('jszip');

      return new Promise((res) => {
         FS.readFile(path, function (err, data) {
            if (err) {
               this.errorLog('err436532', err.message);
               res(false);
            }
            else {
               var zip = new jszip();
               zip.loadAsync(data).then(function (contents) {
                  for (const filename of Object.keys(contents.files)) {
                     if (!filename) continue;
                     // =>check if dir
                     if (zip.files[filename].dir) {
                        FS.mkdirSync(PATH.join(extractPath, filename), { recursive: true });
                     }
                     // =>check if file
                     else {
                        zip.files[filename].async('nodebuffer').then(function (content) {
                           FS.writeFileSync(PATH.join(extractPath, filename), content);
                        });
                     }
                  }
                  res(true);
               });
            }
         });

      });

   }
}