import { Options, Sequelize } from "sequelize";
import { errorLog, config, infoLog, debugLog } from "../helpers/server";
import { ServerDatabaseInfo } from "./interfaces";
import * as PATH from 'path';
import { ModelName } from "../types";
import * as FS from 'fs';

export class ServerDatabase {
   dbConn: Sequelize;
   alterModels = undefined;
   constructor() {

   }
   /************************************************************ */
   alterAllModels() {
      this.alterModels = true;
      infoLog('alter', 'set Alter all database models');
   }
   /************************************************************ */
   async connect() {
      let dbConf = config<ServerDatabaseInfo>('DATABASE_INFO');
      let options: Options = {
         database: dbConf.dbName,
         host: dbConf.host,
         password: dbConf.password,
         storage: dbConf.path,
         username: dbConf.username,
         dialect: dbConf.driver,
         dialectOptions: {
            timezone: 'Z',
            connectTimeout: 1000,
         },
         timezone: config('DEFAULT_TIMEZONE'),
         // disable logging; default: console.log
         logging: dbConf.logging,
      };
      // =>if sqlite, remove custom timezone
      if (dbConf.driver === 'sqlite') {
         delete options.timezone;
      }
      // =>if has port, add it!
      if (dbConf.port) {
         options.port = dbConf.port;
      }
      this.dbConn = new Sequelize(options);
      // =>authenticate in database
      try {
         await this.dbConn.authenticate();
         // =>change collate of database
         if (dbConf.driver === 'mysql' || dbConf.driver === 'mariadb') {
            await this.dbConn.query(`ALTER DATABASE ${dbConf.dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
         }
         return true;
      } catch (error) {
         errorLog('err45', error);
      }
      return false;
   }
   /************************************************************ */
   async syncModel<M extends string = string>(name: M, argvs = [], force = false, alter = false, fullPath?: string) {
      try {
         if (this.alterModels !== undefined) {
            alter = this.alterModels;
         }
         if (!fullPath) {
            fullPath = PATH.join(__dirname, 'models', name + '.js');
         }
         // =>try to import file and define model
         const module = await import(fullPath);
         const res = module['load'](...argvs);
         if (res === false) return false;
         // =>sync model
         // console.log('model for:', name, argvs, res);
         if (res) {
            await res['sync']({
               force, alter,
            });
         } else {
            await this.dbConn.sync();
         }
         debugLog('model', `sync model '${name}' ${res ? 'successfully' : 'failed!'} with alter ${alter}`)
         return true;
      } catch (e) {
         errorLog('err5544', name + ' - ' + argvs + ' - ' + fullPath + ' - ' + e);
         console.error(e);
         return false;
      }
   }
   /************************************************************ */
   async syncInitModels(force = false, alter = false) {
      const coreModels = config<ModelName[]>('INIT_MODELS');
      for (const model of coreModels) {
         // =>detect model path
         let fullPath = PATH.join(__dirname, 'models', model + '.js');
         if (!FS.existsSync(fullPath)) {
            fullPath = PATH.join(__dirname, '..', '..', 'app', 'models', model + '.js');
         }
         const res = await this.syncModel(model, [], force, alter, fullPath);
         // debugLog('model', `init model '${model}' ${res ? 'successfully' : 'failed!'} with alter ${alter}`);
      }
   }

}