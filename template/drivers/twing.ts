import { TwingEnvironment, TwingEnvironmentOptions, TwingLoaderFilesystem, TwingFunction } from 'twing';
import { config } from '../../helpers/server';
import * as PATH from 'path';
import { TemplateDriver } from './driver';
import { ServerTemplateInfo } from '../../interfaces';
import { CoreRequest } from '../../server/request';
import { translate } from '../../helpers/international';

export function load() {
   return twing;
}
export function install() {
   return 'npm install twing --save';
}
/********************************************* */
/********************************************* */
/********************************************* */
export class twing extends TemplateDriver {

   instance: TwingEnvironment;
   langFunction: TwingFunction;
   loader: TwingLoaderFilesystem;
   templatePath: string;

   /*************************************** */
   constructor(info: ServerTemplateInfo) {
      super(info);
      this.templatePath = this.templateInfo.path;
      // =>init loader for fs
      this.loader = new TwingLoaderFilesystem(this.templatePath, this.templatePath);
      this.initTwingEnvironment();
   }
   /*************************************** */
   async render(name: string, params: object = {}) {
      this.initTwingEnvironment();
      // =>load template
      const template = await this.instance.load(name + this.templateInfo.extension);
      // =>render template
      // params = {
      //    ...this.globalVariables,
      // };
      // console.log('render params:', params);
      return await template.render(params);
   }
   /*************************************** */
   initTwingEnvironment() {
      // =>create twing env instance
      this.instance = new TwingEnvironment(this.loader, {
         debug: this.templateInfo.debug,
         auto_reload: config('DEBUG_MODE'),
         cache: PATH.join(config('STORAGE_PATH'), 'cache', 'templates'),
         strict_variables: true,
      });
      // =>set default request var
      this.globalVariables.request = {
         user: undefined,
         isAuth: false,
         path: '/',
         locale: 'en',
         query: {},
         params: {},
      };
      // =>add useful functions
      this.instance.addFunction(new TwingFunction('asset', this.loadCoreFunctions('asset'), []));
      this.instance.addFunction(new TwingFunction('route', this.loadCoreFunctions('route'), []));
      this.instance.addFunction(new TwingFunction('url', this.loadCoreFunctions('url'), []));
      this.instance.addFunction(new TwingFunction('env', this.loadCoreFunctions('env'), []));
      // =>if request exist
      if (this.request) {
         this.globalVariables.request.user = this.request.user();
         this.globalVariables.request.isAuth = this.request.user() !== undefined;
         this.globalVariables.request.locale = this.request.locale;
         this.globalVariables.request.path = this.request.req.path;
         this.globalVariables.request.query = this.request.req.query;
         this.globalVariables.request.params = this.request.req.params;
      }
      // =>add lang functions,
      this.instance.addFunction(new TwingFunction('__', this.loadCoreFunctions('__'), [], { alternative: 'trans' }));
      this.instance.addFunction(new TwingFunction('msg', this.loadCoreFunctions('msg'), []));

      // =>add request global variable
      this.instance.addGlobal('request', this.globalVariables.request);
   }
}