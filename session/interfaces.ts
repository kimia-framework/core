import { CoreUserModel } from './../database/models/interfaces';
import { CoreSession } from "../database/models/CoreSession";
import { CoreUser } from "../database/models/CoreUser";
import { Model } from 'sequelize';
import { AppModelName } from '../../app/models/models';

export interface ServerSessionInfo {
   lifetime: number;
   driver: 'database';
   customSessionModel?: AppModelName, // if session model is custom
   // model: typeof CoreSession;
   filePath?: string;
   cookieName: string;
   cookiePath: string;
   customUserModel?: AppModelName, // if users model is custom
}