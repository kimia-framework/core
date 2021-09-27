import { HttpStatusCode } from './../types';
import { Request, Response } from "express";
import { errorLog, config } from "../../helpers/server";
import { ServerSessionInfo } from "../../session/interfaces";
import { Middleware } from "./middleware";
import { CoreUser } from '../../database/models/CoreUser';
import { CoreUserModel } from '../../database/models/interfaces';
import { SessionModel, userModel } from '../../helpers/auth';
import { AuthenticateUserKey } from '../../data/keys';

export class Authentication extends Middleware {

   async handle(req: Request, res: Response) {
      let sessionInfo = config<ServerSessionInfo>('SESSION_INFO');
      // console.log('Authentication....');
      // =>check 'authentication' header
      if (req.headers['authentication']) {
         const authToken = req.headers['authentication'] as string;
         // =>find user session by token
         const userFind = await Authentication.getUserBySessionToken(authToken);
         if (userFind === 'invalid') {
            return this.responseError(req, HttpStatusCode.HTTP_401_UNAUTHORIZED, 'token not valid');
         } else if (userFind === 'expired') {
            return this.responseError(req, HttpStatusCode.HTTP_401_UNAUTHORIZED, 'token not valid');
         } else {
            req.body[AuthenticateUserKey] = userFind;
         }
      }
      // =>if no have auth
      if (!req.body[AuthenticateUserKey]) {
         errorLog('no_auth_api', JSON.stringify([req.path, req.method]));
         return this.responseError(req, HttpStatusCode.HTTP_401_UNAUTHORIZED, 'auth need');
      }
      return true;
   }
   /***************************************** */
   static async getUserBySessionToken(authToken: string): Promise<CoreUserModel | 'expired' | 'invalid'> {
      // =>find user session by token
      const session = await SessionModel().find(authToken);
      if (session) {
         // =>update session
         session.setDataValue('checked_token_at', new Date().getTime());
         await session.save();
         // =>check expired token
         if (new Date().getTime() > session.getDataValue('expired_token_at')) {
            return 'expired'
         }
         let user = (await userModel().findByPk(session.getDataValue('uid')))?.toJSON() as CoreUserModel;
         // }
         // =>if not found user
         if (!user) {
            return 'invalid';
         }
         return user;
      }
      return 'invalid';
   }
}
