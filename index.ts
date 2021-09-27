import { VERSION, VERSION_NAME } from './data/version';
import { ServerDatabase } from './database/database';
import { Global } from './global';
import { syncUserModel } from './helpers/auth';
import { fallbackServer, infoLog, loadSettings, mkdirRequired, config, errorLog, debugLog } from './helpers/server';
import { Plugin } from './plugins/plugin';
import { PluginName, Plugins } from './plugins/types';
import { HttpErrorHandler } from './server/error-handler';
import { MemoryCache } from './server/memory-cache';
import { HttpWebServer } from './server/webserver';
import { TemplateLoader } from './template/loader';


console.log(`
********************************************************
Kimia-framework Web Server - version ${VERSION} (${VERSION_NAME})
********************************************************
 
`);
// =>load settings by type
if (process.argv[2] == 'dev') {
   loadSettings('development');
} else {
   loadSettings('production');
}

// =>create required dir
mkdirRequired();
// console.log(process.argv)
infoLog('start', `start ${Global.SiteInfo.name} Site - version ${Global.SiteInfo.version} (${Global.ServerSettingsMode})`);
// =>create database instance
Global.Database = new ServerDatabase();
// =>check alter models, if exist
if (process.argv.length > 3 && process.argv[3] == 'alter') {
   Global.Database.alterAllModels();
}
// =>try to connect to database
Global.Database.connect().then(async res => {
   if (res) {
      infoLog('db', 'Connect to Database successfully');
      // =>sync init models
      await Global.Database.syncInitModels();
      // =>sync users model
      await syncUserModel();
      // =>create mem-cache instance
      Global.Cache = new MemoryCache();
      // =>create template loader instance
      Global.TemplateLoader = new TemplateLoader();
      // =>create http error handler instance
      let errClass = config('HTTP_ERROR_HANDLER', HttpErrorHandler);
      Global.ErrorHandler = new errClass();
      // =>create http web server (https)
      Global.WebServer = new HttpWebServer();
      // =>init used plugins
      if (config('USED_PLUGINS')) {
         for (const plug of config<PluginName[]>('USED_PLUGINS')) {
            // =>find plugin by name
            const plugin = Plugins.find(i => i.name === plug);
            // =>if not found
            if (!plugin) {
               errorLog('err435221', `not found plugin ${plug}`);
               continue;
            }
            // =>init plugin class
            const plugClass = new plugin.class(plug);
            // =>check requirements of plugin
            if (!await plugClass.checkRequirements()) {
               errorLog('err456456', `can not load plugin '${plug}', because requirements not installed correctly!`);
               infoLog(plug, plugClass.requirementsInfo());
            }
            // =>init class
            const res = await plugClass.init();
            if (res) {
               debugLog(plug, `plugin (V${plugClass.getVersion()}) init successfully`);
               // =>set plugin instance
               plugin.instance = plugClass;
            } else {
               errorLog('err3e453', `can not init plugin '${plug}'`);
            }
         }
      }


   }
   /**FALLBACK WEB SERVER */
   else {
      fallbackServer();
   }

});


// =>catch bad exit
process.on('uncaughtException', function (err) {
   errorLog('err1', err);
   // fallbackServer();
});