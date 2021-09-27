import { LocaleName } from "../../data/locales";
import { CoreUserModel } from "../../database/models/interfaces";
import { absUrl, webRoute } from "../../helpers/app";
import { translate } from "../../helpers/international";
import { config } from "../../helpers/server";
import { convertMapToObject } from "../../helpers/utils";
import { ServerTemplateInfo } from "../../interfaces";
import { CoreRequest } from "../../server/request";


export abstract class TemplateDriver {

   templateInfo: ServerTemplateInfo;
   request: CoreRequest;
   globalVariables: {
      request?: {
         user: CoreUserModel;
         isAuth: boolean;
         locale: LocaleName;
         path: string;
         query: object;
         params: object;
      };
   } = {};
   /*************************************** */
   constructor(info: ServerTemplateInfo) {
      this.templateInfo = info;
   }
   /*************************************** */
   async preRender(request: CoreRequest, name: string, params?: object): Promise<string> {
      this.request = request;
      return await this.render(name, params);
   }
   /*************************************** */
   protected abstract render(name: string, params?: object): Promise<string>;
   /*************************************** */
   loadCoreFunctions(name: '__' | 'msg' | 'asset' | 'route' | 'env' | 'url'): ((...p: any[]) => Promise<any>) {
      switch (name) {
         case '__':
            return async (s: string, params = {}) => await translate(s, convertMapToObject(params), this.request.locale);
            break;
         case 'msg':
            return async (s: string, params = {}) => await translate('msgs.' + s, convertMapToObject(params), this.request.locale);
         case 'asset':
            return async (s: string) => {
               if (!s.startsWith('/')) s = '/' + s;
               return config('PREFIX_URL') + config('ASSETS_URL') + s;
            };
         case 'route':
            return async (n: string, p: object = {}) => webRoute(n, convertMapToObject(p as any));
         case 'url':
            return async (n: string) => absUrl(n);
         case 'env':
            return async (s: string) => config(s as any);
         default:
            return async () => 'unknown';
      }
   }
}