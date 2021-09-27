import { HttpErrorHandler } from './server/error-handler';
import { DatabaseModel } from './database/Model';
import { LocaleName } from "./data/locales";
import { ServerDatabaseInfo } from "./database/interfaces";
import { ServerSessionInfo } from "./session/interfaces";
import { HttpMethod, ModelName } from "./types";
import { Middleware } from './server/types';
import { Response } from 'express';
import { AppView } from '../app/views/views';
import { AppModelName } from '../app/models/models';
import { PluginName } from './plugins/types';


export interface CoreKimiaSettings {
   SITE_INFO: SiteInfo;

   DEBUG_MODE: boolean;
   SERVER_PORT: number;
   API_PATH: string;
   STORAGE_PATH: string;
   ASSETS_PATH: string;
   LOCALES_PATH: string;
   TMP_PATH: string;
   // STATIC_PATH?: string;
   /**
    * BASE URL OF SERVER (EX: /server)
    * like for http://sites.com/site1 is '/site1'
    */
   PREFIX_URL: string;
   /**
    * how to get assets from resources/assets files from web
    */
   ASSETS_URL: string;
   DEFAULT_LOCALE: LocaleName;
   FALLBACK_LOCALE: LocaleName;
   DEFAULT_TIMEZONE: string;

   INIT_MODELS: ModelName[];

   SESSION_INFO: ServerSessionInfo;
   LOG_INFO: ServerLogInfo;
   // DEFAULT_MODELS: DefaultModels;
   DATABASE_INFO: ServerDatabaseInfo;

   MEMORY_CACHE_INFO: MemoryCacheInfo;
   TEMPLATE_INFO: ServerTemplateInfo;
   UPLOAD_INFO: ServerUploadInfo;

   /**
    * app, core middlewares that effect on all routings
    */
   PUBLIC_MIDDLEWARES?: Middleware[];

   HTTP_ERROR_HANDLER?: typeof HttpErrorHandler;

   USED_PLUGINS?: PluginName[];

}

export interface ServerUploadInfo {
   path: string;
   fieldName: string;
   customFileModel?: AppModelName, // if session model is custom
   url: string;
}

export interface ServerTemplateInfo {
   engine: 'twing'; //'liquidjs' | 'eta' | 'art-template' | 'ejs'
   extension: string;
   debug?: boolean;
   path: string;
}

export interface MemoryCacheInfo {
   maxMemoryCacheSize: number;
   /**
    * in minutes
    */
   memoryCacheExpired: number;
}

export interface SiteInfo {
   name: string
   id?: number;
   version?: string;
   poweredBy?: string;
   host?: string;
   [k: string]: string | boolean | number;
}

export interface ServerLogInfo {
   modelName: string;
   path: string;
}

export interface LanguageInfo {
   latin: string;
   code: LocaleName;
   native?: string;
   defaultFontName?: string;
   direction?: 'ltr' | 'rtl';
   timeFormat?: string;
   dateFormat?: string;
   calendar?: 'jalali' | 'gregorian' | 'auto';
}

export interface AppModule {
   declarations: { [k in HttpMethod]: new () => any };
}

export interface HttpRoute {
   /**
    * when route bty name used
    */
   name?: string;
   /**
    * can use variables like '/user/{id}'
    * you can use optional variables like '/user/{id?}'
    * you can also determine var type like {id:number}
    * required
    */
   path: string;
   /**
    * when conflict on match path or not, you can decide!
    * like for path '/:lang/home' you can decide for lang variable is correct or not and go next route
    */
   resolver?: (params: object) => boolean; //TODO:
   /**
    * default: GET
    */
   method?: HttpMethod;
   /**
    * default: not set
    */
   methods?: HttpMethod[];
   /**
    * redirect path to this path
    */
   redirectPath?: string;
   /**
    * go to template by name
    */
   template?: string;
   templateParams?: object;
   /**
    * go to view by name like ['users', 'login']
    */
   view?: [viewName: AppView, functionName: string];

   function?: (params?: object) => string;

   /**
    * include except public middlewares in settings
    */
   includeMiddlewares?: Middleware[];
   /**
    * exclude public middlewares in settings
    */
   // excludeMiddlewares?: Middleware[]; //TODO:
}

export interface MemoryCacheItem {
   key: number | string;
   expired_in: number; // timestamp
   value: any;
   size: number; // bytes
}
