import { CoreRequest } from './../server/request';
import { TemplateDriver } from "./drivers/driver";
import * as PATH from 'path';
import { ServerTemplateInfo } from "../interfaces";
import { config, errorLog } from "../helpers/server";


export class TemplateLoader {
   driver: TemplateDriver;
   settings: ServerTemplateInfo;
   /*************************************** */
   constructor() {
      // =>load template settings
      this.settings = config('TEMPLATE_INFO');
      // =>load template driver by settings
      this.loadDriver();
   }
   /*************************************** */
   async loadDriver() {
      try {
         // =>import driver
         const driverFile = await import(PATH.join(__dirname, 'drivers', this.settings.engine + '.js'));
         // =>get driver class
         const driverClass = driverFile['load']();
         // =>init driver class
         this.driver = new driverClass(this.settings);
      } catch (e) {
         errorLog('err436543', e);
      }
   }
   /*************************************** */
   async render(request: CoreRequest, filename: string, params: object = {}): Promise<string> {
      return await this.driver.preRender(request, filename, params);
   }
}