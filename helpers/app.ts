import { ROUTES } from "../../routes/web";
import { ServerRequestType } from "../server/types";
import { config } from "./server";
import * as FS from 'fs';
import * as PATH from 'path';
import { CoreFile } from "../database/models/CoreFile";
import { ServerUploadInfo, SiteInfo } from "../interfaces";
import { AppModels } from "../../app/models/models";


export function webRoute(name: string, params: object = {}, full = true, type: ServerRequestType = 'web') {
   let path = '';
   // =>if web type
   if (type === 'web') {
      for (const r of ROUTES) {
         // =>if match name
         if (r.name === name) {
            path = r.path;
            break;
         }
      }
   }
   // =>if api type
   else if (type === 'api') {
      //TODO:
   }
   // =>replace params in path
   const pathSp = path.split('/');
   // console.log('webRoute:', path, params, pathSp);
   let rebuildSegments: string[] = [];
   // =>iterate path segments
   for (let i = 0; i < pathSp.length; i++) {
      let seg = pathSp[i];
      // =>check route segment is var
      if (seg.match(/\{\w+(\:\w+)?\?*\}/)) {
         // =>extract var name
         let varName = seg.substring(1, seg.length - 1);
         let isVarOptional = false;
         // =>check var is optional
         if (varName[varName.length - 1] === '?') {
            isVarOptional = true;
            varName = varName.substring(0, varName.length - 1);
         }

         // =>check var data type
         if (varName.split(':').length > 1) {
            varName = varName.split(':')[0];
         }
         // console.log('param:', varName, seg);
         // =>if param not exist
         if (params[varName] === undefined && !isVarOptional) seg = '';
         // =>set param on segment
         else {
            seg = params[varName];
         }
      }
      rebuildSegments.push(seg);
   }
   path = rebuildSegments.join('/');

   if (full) {
      if (config<SiteInfo>('SITE_INFO').host) {
         return config<SiteInfo>('SITE_INFO').host + config('PREFIX_URL') + path;
      } else {
         return config('PREFIX_URL') + path;
      }
   }
   return path;
}

/******************************************* */
export function fileModel<C = typeof CoreFile>(): C {
   let customModel = config<ServerUploadInfo>('UPLOAD_INFO').customFileModel;
   // =>if custom model
   if (customModel) {
      return AppModels.find(i => i.name === customModel).class as any;
   }
   // =>if core model
   else {
      return CoreFile as any;
   }
}
/******************************************* */
export async function generateUploadedFile(filename: string) {
   return config('PREFIX_URL') + config('UPLOAD_INFO').url + '/' + filename;
}
/******************************************* */
export function absUrl(url: string) {
   let host = config<SiteInfo>('SITE_INFO').host;
   if (!host) return url;
   if (url.startsWith(host)) return url;
   if (host[host.length - 1] === '/') {
      host = host.substring(0, host.length - 1);
   }
   if (url[0] !== '/') url = '/' + url;

   return host + url;
}

