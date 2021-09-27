import { VERSION_NAME } from './../data/version';
import { SiteInfo } from './../interfaces';
import * as PATH from 'path';
import * as FS from 'fs';
import { Global } from '../global';
import { KimiaSettings, ServerMode } from '../types';
import { load as SettingsDev } from '../../settings/dev';
import { load as SettingsProd } from '../../settings/prod';
import * as HTTP from 'http';
import { VERSION } from '../data/version';
import * as CHILD_PROCESS from 'child_process';


export function config<T = any, S extends KimiaSettings = KimiaSettings>(key: keyof S, def: T = undefined): T {
   if (Global.ServerSettings[key as any] !== undefined) {
      return Global.ServerSettings[key as any] as any;
   }
   return def;
}
/***************************************** */
export function loadSettings(mode: ServerMode) {
   Global.ServerSettingsMode = mode;
   if (mode === 'development') {
      Global.ServerSettings = SettingsDev();
   } else if (mode === 'production') {
      Global.ServerSettings = SettingsProd();
   }
   // =>set site info
   Global.SiteInfo = config<SiteInfo>('SITE_INFO', { name: 'app' });
}
/***************************************** */
export function mkdirRequired() {
   // =>mkdir logs dir
   FS.mkdirSync(PATH.join(config('STORAGE_PATH'), 'logs'), { recursive: true });

   // =>check size of log files (bigger than 5M=5,000,000 bytes)
   let logFiles = ['errors', 'info'];
   for (const log of logFiles) {
      if (FS.existsSync(PATH.join(config('STORAGE_PATH'), log)) && FS.statSync(PATH.join(config('STORAGE_PATH').VARS_PATH, log)).size > 5000000) {
         FS.unlinkSync(PATH.join(config('STORAGE_PATH'), log));
      }
   }
}
/***************************************** */
function log(text: string, label?: string, type: 'info' | 'error' | 'normal' | 'debug' = 'normal') {
   let dateTime = new Date();
   let time = dateTime.toTimeString().slice(0, 8);
   let date = dateTime.toISOString().slice(0, 10).replace(/-/g, '.');
   let message = `[${date}-${time}:${dateTime.getMilliseconds()}] : ${text}`;
   if (label) {
      message = `[${date}-${time}:${dateTime.getMilliseconds()}] ${label} : ${text}`;
   }
   if (type === 'error') {
      console.error("\x1b[31m\x1b[1m" + message);
   } else if (type === 'info') {
      console.log("\x1b[34m\x1b[1m" + message);
   } else if (type === 'debug') {
      console.log("\x1b[33m\x1b[1m" + message);
   } else {
      console.log(message);
   }
}
/***************************************** */
export function infoLog(name: string, message: string) {
   log(message, name, 'info');
   try {
      let time = new Date().toTimeString().slice(0, 8);
      let date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      if (typeof message === 'object') {
         message = JSON.stringify(message);
      }
      FS.writeFileSync(PATH.join(config('LOG_INFO').path, 'info'), `[${date}-${time}] ${name} ${message}\n`, {
         flag: 'a',
      });
   } catch (e) {
      log(`can not write on ${PATH.join(config('LOG_INFO').path, 'info')} file`, 'err455563', 'error');
   }
}
/***************************************** */
export function debugLog(name: string, message: string) {
   // console.log(settings('DEBUG_MODE'))
   if (!config('DEBUG_MODE')) return;
   log(message, name, 'debug');
   try {
      let time = new Date().toTimeString().slice(0, 8);
      let date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      if (typeof message === 'object') {
         message = JSON.stringify(message);
      }
      FS.writeFileSync(PATH.join(config('LOG_INFO').path, 'debug'), `[${date}-${time}] ${name} ${message}\n`, {
         flag: 'a',
      });
   } catch (e) {
      log(`can not write on ${PATH.join(config('LOG_INFO').path, 'debug')} file`, 'err455563', 'error');
   }
}
/***************************************** */
export function errorLog(name: string, error: any, uid?: string) {
   if (config('DEBUG_MODE') && typeof error !== 'string') {
      console.error(error);
   }
   log(error, name, 'error');
   let time = new Date().toTimeString().slice(0, 8);
   let date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
   if (typeof error === 'object') {
      error = JSON.stringify(error);
   }
   try {
      FS.writeFileSync(PATH.join(config('LOG_INFO').path, 'errors'), `[${date}-${time}] ${name} ${uid}::${error}\n`, {
         flag: 'a',
      });
   } catch (e) {
      log(`can not write on ${PATH.join(config('LOG_INFO').path, 'errors')} file`, 'err4553', 'error');
   }
}
/***************************************** */
export function fallbackServer() {
   // =>run a simple webserver
   let app = HTTP.createServer((req, res) => {
      // Set a response type of plain text for the response
      res.writeHead(200, { 'Content-Type': 'text/plain' });

      // Send back a response and end the connection
      res.end(`
      Kimia framework Server version ${VERSION} (${VERSION_NAME}) is Down :(\n
      This is A fallback Webserver!`);
   });

   // Start the server on port 3000
   let port = config('SERVER_PORT', 8081);
   app.listen(port, '0.0.0.0');
   console.log('Fallback server running on port ', port);
}
/***************************************** */
export async function restartServer() {
   try {
      setTimeout(() => {
         process.on("exit", () => {
            CHILD_PROCESS.spawn(
               process.argv.shift(), process.argv, {
               cwd: process.cwd(),
               detached: true,
               stdio: "inherit"
            });
         });
         process.exit();
      }, 2000);
   } catch (e) {
      errorLog('err4575756', e);
      return false;
   }
}