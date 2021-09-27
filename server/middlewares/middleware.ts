import { Request, Response } from "express";
import { CoreRequestKey } from "../../data/keys";
import { Global } from "../../global";
import { config } from "../../helpers/server";
import { HttpStatusCode, CoreMiddleware } from "../types";


export abstract class Middleware {
   /*************************************** */
   constructor() {

   }
   /*************************************** */
   responseError(req: Request, statusCode: HttpStatusCode = HttpStatusCode.HTTP_404_NOT_FOUND, reason?: string) {
      Global.ErrorHandler.switchHandler(req.body[CoreRequestKey], statusCode, reason);
      return false;
   }
   /*************************************** */
   abstract handle(req: Request, res: Response): Promise<boolean>;
}
