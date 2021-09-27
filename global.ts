import { MemoryCache } from './server/memory-cache';
import { ServerDatabase } from './database/database';
import { SiteInfo } from './interfaces';
import { KimiaSettings, ServerMode } from './types';
import { HttpWebServer } from './server/webserver';
import { TemplateLoader } from './template/loader';
import { HttpErrorHandler } from './server/error-handler';


export namespace Global {
   export let ServerSettings: KimiaSettings;

   export let ServerSettingsMode: ServerMode;

   export let Database: ServerDatabase;

   export let Cache: MemoryCache;

   export let WebServer: HttpWebServer;

   export let SiteInfo: SiteInfo;

   export let TemplateLoader: TemplateLoader;

   export let ErrorHandler: HttpErrorHandler;
}