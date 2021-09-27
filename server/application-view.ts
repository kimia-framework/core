import { CoreLog } from '../database/models/CoreLog';
import { Global } from '../global';
import { fileModel, webRoute } from '../helpers/app';
import { config, debugLog, errorLog, infoLog } from '../helpers/server';
import { LogMode } from '../types';
import { CoreRequest } from './request';
import { HttpStatusCode } from "./types";
import * as FS from 'fs';
import * as PATH from 'path';


export class ApplicationView {
   request: CoreRequest;
   /*************************************** */
   constructor(request: CoreRequest) {
      this.request = request;
   }
   /*************************************** */
   async render(templateName: string, params?: object) {
      return [await Global.TemplateLoader.render(this.request, templateName, params), HttpStatusCode.HTTP_200_OK];
   }
   /*************************************** */
   param<T = string>(key: string, def?: T, isArray = false) {
      let value: T;
      if (this.request.method === 'GET' || this.request.method === 'DELETE') {
         value = this.request.req.query[key] as any;
         if (isArray) {
            try {
               value = JSON.parse(value as any);
            } catch (e) { }
         }
      } else {
         value = this.request.req.body[key];
      }
      if (!value && def) {
         value = def;
      }
      return value;
   }
   /*************************************** */
   paramNumber<T extends number = number>(key: string, def?: T): T {
      let value = Number(this.param<T>(key, def));
      if (isNaN(value)) return def;
      return value as T;
   }
   /*************************************** */
   paramBoolean(key: string, def?: boolean) {
      let value = this.param(key, def);
      if (value as any === 'true') return true;
      if (value as any === 'false') return false;
      return Boolean(value);
   }
   /*************************************** */
   response<T = any>(result?: T, code: HttpStatusCode = HttpStatusCode.HTTP_200_OK) {
      return [result, code];
   }
   /*************************************** */
   redirect(name: string, params: object = {}) {
      // =>find route path by name
      const path = webRoute(name, params, true, this.request.requestType);
      if (path) {
         this.request.redirect(path);
      }
   }
   /*************************************** */
   error(code: HttpStatusCode = HttpStatusCode.HTTP_400_BAD_REQUEST, data?: string | object) {
      return Global.ErrorHandler.switchHandler(this.request, code, data);
   }
   /*************************************** */
   error404(data?: string | object) {
      return this.error(HttpStatusCode.HTTP_404_NOT_FOUND, data);
   }
   /*************************************** */
   error403(data?: string | object) {
      return this.error(HttpStatusCode.HTTP_403_FORBIDDEN, data);
   }
   /*************************************** */
   async errorLog(namespace: string, name: string, var1?: any, var2?: any) {
      await this.log(namespace, name, LogMode.ERROR, var1, var2);
      errorLog('log', '[ERROR] ' + namespace + ':' + name + ' | ' + var1 + ', ' + var2);
   }
   /*************************************** */
   async infoLog(namespace: string, name: string, var1?: any, var2?: any) {
      await this.log(namespace, name, LogMode.INFO, var1, var2);
      debugLog('log', '[INFO] ' + namespace + ':' + name + ' | ' + var1 + ', ' + var2);
   }
   /*************************************** */
   async log(namespace: string, name: string, mode: LogMode, var1?: any, var2?: any) {
      try {
         await CoreLog.create({
            name,
            namespace,
            uid: this.request.user() ? this.request.user().id : undefined,
            ip: this.request.clientIp(),
            mode,
            var1: var1 ? String(var1) : undefined,
            var2: var2 ? String(var2) : undefined,
            created_at: new Date().getTime(),
         });
      } catch (e) {
         console.trace();
         errorLog('err6655', e);
      }
   }
   /*************************************** */
   /**
    * 
    * @param path relative path in upload path
    * @param check: if you want to check uploaded file is valid or revert uploaded file
    */
   async uploadFile(path: string, check?: (file: Express.Multer.File) => Promise<boolean>) {
      try {
         // =>set absolute path
         path = PATH.join(config('UPLOAD_INFO').path, path);
         // =>check folder exist
         FS.mkdirSync(path, { recursive: true });
         const file = this.request.req.file;
         console.log('upload info:', file);
         // =>validate uploaded file
         if (check && !(await check(file))) {
            // =>remove file
            FS.unlinkSync(file.path);
            return undefined;
         }
         // =>move uploaded file to dest path
         FS.renameSync(file.path, PATH.join(path, file.filename));
         // =>update file path
         file.path = path;
         // =>add file to database
         await fileModel().create({
            path: file.path,
            filename: file.filename,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            created_by: this.request.user().id,
         });
         return file.filename;
      } catch (e) {
         errorLog('err4353221', e);
         return undefined;
      }
   }


}