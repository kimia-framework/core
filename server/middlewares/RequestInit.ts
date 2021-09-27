import { Request, Response } from "express";
import { CoreRequestKey } from "../../data/keys";
import { Global } from "../../global";
import { config } from "../../helpers/server";
import { CoreRequest } from "../request";
import { Middleware } from "./middleware";

export class RequestInit extends Middleware {


   async handle(req: Request, res: Response) {
      // =>init core request
      req.body[CoreRequestKey] = new CoreRequest(req, res);
      // =>set default locale
      req.body[CoreRequestKey].setLocale(config('DEFAULT_LOCALE'));

      return true;
   }
}