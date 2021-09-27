import { Request, Response } from "express";
import { Global } from "../../global";
import { Middleware } from "./middleware";
import * as PATH from 'path';
import { config, debugLog } from "../../helpers/server";
import { HttpStatusCode } from "../types";
import * as FS from "fs";
import { fileModel } from "../../helpers/app";
import { dirname } from "path";

export class StaticFiles extends Middleware {


   async handle(req: Request, res: Response) {
      const assetsPath = config('ASSETS_PATH');
      const assetsUrl = config('PREFIX_URL') + config('ASSETS_URL') + '';
      const uploadUrl = config('PREFIX_URL') + config('UPLOAD_INFO').url + '';
      // =>if match assets url
      if (req.path.startsWith(assetsUrl)) {
         let path = req.path.substr(assetsUrl.length);
         // =>check exist asset
         if (!FS.existsSync(PATH.join(assetsPath, path))) {
            return this.responseError(req, HttpStatusCode.HTTP_404_NOT_FOUND);
         }
         debugLog('asset', `${path}`);
         // =>set options
         const options = {
            root: assetsPath,
            dotfiles: 'deny',
            headers: {
               'x-timestamp': Date.now(),
               'x-sent': true
            }
         }
         res.sendFile(path, options);
         return false;
      }
      // =>if match upload url
      else if (req.path.startsWith(uploadUrl)) {
         let path = req.path.substr(uploadUrl.length);
         // =>get upload filename
         const filename = path.split('/').pop();
         // =>find file by filename in db
         const file = await fileModel().findOne({ where: { filename } });
         // =>if file not found in db
         if (!file) {
            return this.responseError(req, HttpStatusCode.HTTP_404_NOT_FOUND);
         }
         // =>check exist file in fs
         if (!FS.existsSync(file.getDataValue('path'))) {
            return this.responseError(req, HttpStatusCode.HTTP_404_NOT_FOUND);
         }
         debugLog('upload', `${path}`);
         // =>set options
         const options = {
            root: file.getDataValue('path'),
            dotfiles: 'deny',
            headers: {
               'x-timestamp': Date.now(),
               'x-sent': true
            }
         }
         res.sendFile(filename, options);
         return false;
      }

      return true;
   }
}