import { LocaleName } from './../data/locales';
import { Request, Response } from "express";
import { HttpStatusCode, RequestMethodType, ServerRequestType } from "./types";
import { config, debugLog } from '../helpers/server';
import { ROUTES } from '../../routes/web';
import { AuthenticateUserKey } from '../data/keys';
import { CoreUserModel } from '../database/models/interfaces';
import { logout, userModel } from '../helpers/auth';

export class CoreRequest {
   req: Request;
   res: Response;
   method: RequestMethodType = 'GET';
   params: object;
   requestType: ServerRequestType = 'web';
   responseTime: number;
   locale: LocaleName;
   /************************************* */
   constructor(req: Request, res: Response) {
      this.req = req;
      this.res = res;
      // =>set request method
      this.method = req.method.toUpperCase() as any;
   }
   /************************************* */
   setLocale(locale: LocaleName) {
      this.locale = locale;
   }
   /************************************* */
   get<T = string>(key: string, def: T = undefined): T {
      if (this.params[key] !== undefined && this.params[key] !== null) {
         return this.params[key] as any;
      }
      return def;
   }
   /************************************* */
   calculateResponseTime() {
      if (!this.responseTime) return;
      // =>get diff of response
      const diff = new Date().getTime() - this.responseTime;
      // =>add api calls count
      // GlobalVariables.SERVER_RESPONSE.apiCalls++;
      // =>add response time
      // GlobalVariables.SERVER_RESPONSE.totalResponseTime += diff;
      return diff;
   }
   /************************************* */
   response(body: any, statusCode: HttpStatusCode = HttpStatusCode.HTTP_200_OK) {
      // =>if before send data, ignore
      if (this.res.writableEnded) return;
      // console.log('response:', this.res.statusCode, this.res.writableEnded);
      this.res.status(statusCode).send(body);
      debugLog('response', `[${statusCode}] ${this.requestType}:${this.req.path}`);
   }
   /************************************* */
   findRouteByName(name: string) {
      // =>if web type
      if (this.requestType === 'web') {
         return ROUTES.find(i => i.name === name);
      }
      // =>if api type
      else if (this.requestType === 'api') {
         //TODO:
      }
      return undefined;
   }
   /************************************* */
   redirect(path: string) {
      debugLog('request', `redirect from to ${this.requestType}:${path}`);
      // =>if web type
      if (this.requestType === 'web') {
         this.res.redirect(path);
      }
      // =>if api type
      else if (this.requestType === 'api') {
         //TODO:
      }
   }
   /************************************* */
   user<T = CoreUserModel>(): T {
      return this.req.body[AuthenticateUserKey];
   }
   /************************************* */
   async updateUser() {
      if (!this.user()) return false;
      this.req.body[AuthenticateUserKey] = (await userModel().findByPk(this.user().id)).toJSON();
      return true;
   }
   /************************************* */
   async logout() {
      // =>get user
      const user = this.user();
      if (user) {
         return await logout(user.id, this.res);
      }
      return undefined;
   }
   /************************************* */
   clientIp(): string {
      return this.req.ip || JSON.stringify(this.req.ips);
   }

}