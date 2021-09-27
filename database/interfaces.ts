import { Dialect } from 'sequelize/types';
import { DatabaseModel } from './Model';


export interface ServerDatabaseInfo {
   driver: Dialect;
   path?: string;
   username?: string;
   password?: string;
   dbName?: string;
   host?: string;
   port?: number;
   logging?: boolean | ((sql: string, timing?: number) => void);

}
