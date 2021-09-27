import { Request, Response } from "express";
import { AppViews } from "../../app/views/views";
import { ROUTES } from "../../routes/web";
import { CoreRequestKey, RouteInfoKey } from "../data/keys";
import { Global } from "../global";
import { config, debugLog, errorLog } from "../helpers/server";
import { HttpRoute } from "../interfaces";
import { RequestRouteInfo } from "./interfaces";
import { CoreRequest } from "./request";
import { HttpStatusCode } from "./types";


export class RouteExecuter {
   request: Request;
   response: Response;
   route: HttpRoute;
   routerInfo: RequestRouteInfo;
   responseTime: number;
   coreRequest: CoreRequest;
   /***************************************** */
   constructor(req: Request, res: Response) {
      this.request = req;
      this.response = res;
      // =>start response time
      this.responseTime = new Date().getTime();
      this.request[CoreRequestKey] = this.responseTime;
      // =>get router info
      // console.log(this.request.body)
      this.routerInfo = this.request.body[RouteInfoKey];
      // =>decide by type
      if (this.routerInfo.type === 'web') {
         // =>find route by index
         this.route = ROUTES[this.routerInfo.index];
      } else {
         //TODO:
      }
      // =>get core request class
      this.coreRequest = this.request.body[CoreRequestKey];
      // =>check for redirect
      if (this.route.redirectPath) {
         this.coreRequest.redirect(this.route.redirectPath);
      }
      // =>check for function exist
      else if (this.route.function) {
         this.response.send(this.route.function(this.routerInfo.params));
      }
      // =>check for view exist
      else if (this.route.view) {
         this.initView();
      }
      // =>check for template exist
      else if (this.route.template) {
         this.goToTemplate();
      }
   }
   /***************************************** */
   async goToTemplate() {
      try {
         // =>render template file
         const html = await Global.TemplateLoader.render(this.coreRequest, this.route.template, this.route.templateParams ?? {});
         // =>response html
         this.coreRequest.response(html);
      } catch (e) {
         errorLog('err43673', e);
         return Global.ErrorHandler.switchHandler(this.coreRequest, HttpStatusCode.HTTP_500_INTERNAL_SERVER_ERROR, config('DEBUG_MODE') ? e : '');
      }
   }
   /***************************************** */
   async initView() {
      try {
         const [className, funcName] = this.route.view;

         debugLog('request', `view call '${className}@${funcName}'`);
         // =>find app view by class name 
         const appView = AppViews.find(i => i.name === className);
         // =>init view class
         let viewClassInstance = new appView.class(this.coreRequest);
         // =>call view function
         let resP = await viewClassInstance[funcName]();
         let response: string, status: HttpStatusCode;
         if (Array.isArray(resP)) {
            [response, status] = resP;
         }
         // =>response 
         this.coreRequest.response(response, status);
      } catch (e) {
         errorLog('err436', e);
         return Global.ErrorHandler.switchHandler(this.coreRequest, HttpStatusCode.HTTP_500_INTERNAL_SERVER_ERROR, config('DEBUG_MODE') ? e : '');
      }
   }
   /***************************************** */
}