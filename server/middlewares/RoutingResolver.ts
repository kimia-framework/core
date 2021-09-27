import { Request, Response } from "express";
import { ROUTES } from "../../../routes/web";
import { CoreRequestKey, RouteInfoKey } from "../../data/keys";
import { Global } from "../../global";
import { config, debugLog } from "../../helpers/server";
import { HttpRoute } from "../../interfaces";
import { RequestRouteInfo } from "../interfaces";
import { HttpStatusCode } from "../types";
import { Middleware } from "./middleware";

export class RoutingResolver extends Middleware {
   req: Request;
   path: string;

   /*************************************** */
   async handle(req: Request, res: Response) {
      this.req = req;
      this.path = this.req.path;
      // =>remove prefix url from path
      if (config('PREFIX_URL')) {
         this.path = this.path.substr(config<string>('PREFIX_URL').length);
      }
      // =>normalize path
      this.path = '/' + this.path.split('/').filter(i => i.trim() !== '').join('/');
      debugLog('request', `[${this.req.method.toUpperCase()}] ${this.path}`);
      // console.log(this.req.path, this.path);
      // =>check web routes
      const res1 = await this.checkWebRoutes();
      // =>check api routes
      //TODO:
      if (!res1) {
         return this.responseError(req, HttpStatusCode.HTTP_404_NOT_FOUND);
      }
      // =>get route info
      const routeInfo = this.req.body[RouteInfoKey] as RequestRouteInfo;
      if (routeInfo && routeInfo.index !== undefined) {
         let routeObject: HttpRoute;
         // =>if web route
         if (routeInfo.type === 'web') {
            routeObject = ROUTES[routeInfo.index];
         }
         //TODO:
         // =>run include middlewares
         if (routeObject.includeMiddlewares) {
            for (const middle of routeObject.includeMiddlewares) {
               // =>load middleware class
               const middleClass = Global.WebServer.loadMiddleware(middle);
               // =>run middleware dynamically!
               const middleResponse = await middleClass.handle(req, res);
               // =>if response failed!
               if (!middleResponse) {
                  return false;
               }
            }
         }
      }

      return true;
   }
   /*************************************** */
   async checkWebRoutes() {
      // =>iterate web routes
      for (let i = 0; i < ROUTES.length; i++) {
         const route = ROUTES[i];
         let matchMethod = false;
         // =>match url methods, if exist
         if (route.methods && route.methods.includes(this.req.method.toLowerCase() as any)) {
            matchMethod = true;
         }
         // =>match url method
         if (!route.method) route.method = 'get';
         if (route.method === this.req.method.toLowerCase()) matchMethod = true;
         if (!matchMethod) continue;
         // console.log('route:', this.path, route.path)
         // =>match path and extract params
         const params = this.mapRoutePath(this.path, route.path);
         // =>if not find match params
         if (params === false) continue;
         // console.log('params:', params, this.req.body);
         this.req.body[RouteInfoKey] = {
            type: 'web',
            index: i,
            params,
         } as RequestRouteInfo;
         // =>set request params
         this.req.body[CoreRequestKey].params = params;
         // =>set request type
         this.req.body[CoreRequestKey].requestType = 'web';
         return true;
      }
      return false;
   }
   /*************************************** */
   mapRoutePath(path: string, routePath: string) {
      let params = {};
      // =>split paths
      const pathSp = path.substr(1).split('/');
      const routePathSp = routePath.substr(1).split('/');
      // =>check if route path is bigger than path
      if (routePathSp.length > pathSp.length) {
         for (let j = 0; j < routePathSp.length - pathSp.length; j++) {
            pathSp.push('');
         }
      }
      // =>iterate path segments
      for (let i = 0; i < pathSp.length; i++) {
         const seg = pathSp[i];
         if (routePathSp.length < i + 1) return false;
         const routeSeg = routePathSp[i];
         // =>check route segment is var
         if (routeSeg.match(/\{\w+(\:\w+)?\?*\}/)) {
            // =>extract var name
            let varName = routeSeg.substring(1, routeSeg.length - 1);
            let isVarOptional = false;
            let varType: 'number' | 'string' = 'string';
            // =>check var is optional
            if (varName[varName.length - 1] === '?') {
               isVarOptional = true;
               varName = varName.substring(0, varName.length - 1);
            }
            // =>if segment not exist or null
            if (seg === '' && !isVarOptional) return false;
            // =>check var data type
            if (varName.split(':').length > 1) {
               if (varName.split(':')[1] === 'number') {
                  // =>check seg is number type
                  if (isNaN(seg as any)) return false;
                  varType = 'number';
               }
               varName = varName.split(':')[0];
            }
            // =>set param, if exist
            if (seg && seg !== '') {
               switch (varType) {
                  case 'number':
                     params[varName] = Number(seg);
                     break;
                  default:
                     params[varName] = seg;
                     break;
               }
            }
         }
         // =>compare segment, if not var
         else if (routeSeg !== seg) {
            return false;
         }
      }

      return params;
   }
}