import { Request, Response } from "express";
import { Middleware } from "./middleware";
import multer from 'multer';
import { config } from "../../helpers/server";
import { ServerUploadInfo } from "../../interfaces";

export class UploadFile extends Middleware {

   async handle(req: Request, res: Response) {
      // To upload multiple image 
      //var upload = multer({ storage: storage }).array('images', maxCount);
      // req.files is array of `images` files
      // maxCount files could be uploaded 
      // =>get upload info
      const uploadInfo = config<ServerUploadInfo>('UPLOAD_INFO');
      const upload = multer({ dest: uploadInfo.path }).single(uploadInfo.fieldName);
      // =>call upload middleware
      upload(req, res, () => { });

      return true;
   }
}