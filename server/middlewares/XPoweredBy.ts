import { Request, Response } from "express";
import { Global } from "../../global";
import { Middleware } from "./middleware";

export class XPoweredBy extends Middleware {


   async handle(req: Request, res: Response) {
      if (Global.SiteInfo.poweredBy) {
         res.setHeader('X-Powered-By', Global.SiteInfo.poweredBy + '/' + Global.SiteInfo.version);
      }
      return true;
   }
}