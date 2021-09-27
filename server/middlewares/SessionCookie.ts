import { AuthenticateUserKey } from './../../data/keys';
import { Authentication } from './Authentication';
import { ServerSessionInfo } from './../../session/interfaces';
import { Request, Response } from "express";
import { Global } from "../../global";
import { config, debugLog } from "../../helpers/server";
import { Middleware } from "./middleware";

export class SessionCookie extends Middleware {


   async handle(req: Request, res: Response) {
      // =>parse cookies
      const cookies = this.parseCookies(req);
      // =>search on cookies for session token
      const sessionToken = cookies[config<ServerSessionInfo>('SESSION_INFO').cookieName];
      // =>if token exist, set as header
      if (sessionToken) {
         debugLog('session', sessionToken);
         // =>set 'authentication' header
         req.headers['authentication'] = sessionToken;
         // =>find user session by token
         const userFind = await Authentication.getUserBySessionToken(sessionToken);
         if (typeof userFind !== 'string') {
            req.body[AuthenticateUserKey] = userFind;
         }
      }
      return true;
   }

   /*************************************** */
   parseCookies(request: Request) {
      var list = {},
         rc = request.headers.cookie;

      rc && rc.split(';').forEach(function (cookie) {
         var parts = cookie.split('=');
         list[parts.shift().trim()] = decodeURI(parts.join('='));
      });

      return list;
   }
}