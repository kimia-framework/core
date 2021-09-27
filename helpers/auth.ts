import * as bcrypt from 'bcrypt';
import * as PATH from 'path';
import { Request, Response } from 'express';
import { Model, ModelStatic } from 'sequelize';
import { AppModels } from '../../app/models/models';
import { CoreSession } from '../database/models/CoreSession';
import { CoreUser } from '../database/models/CoreUser';
import { Global } from '../global';
import { CoreRequest } from '../server/request';
import { ServerSessionInfo } from '../session/interfaces';
import { config, infoLog } from './server';
import { CoreUserModel } from '../database/models/interfaces';

/**
 * get username, password and check auth user and return user object or undefined for not found!
 * @param username 
 * @param password 
 * @param usernameField 
 * @param passwordFiled 
 * @returns CoreUser | undefined
 */
export async function authenticate(username: string, password: string, usernameField = 'username', passwordFiled = 'password') {
   if (!username || !password) return undefined;
   // =>find user by username
   let where = {};
   where[usernameField] = username;
   const user = await userModel().findOne({ where });
   // =>if ont exist
   if (!user) return undefined;
   // =>check user password
   if (!await comparePassword(user.getDataValue(passwordFiled as any), password)) {
      return undefined;
   }

   return user;
}
/******************************************* */
export async function login(uid: number, request: CoreRequest) {
   let session = config<ServerSessionInfo>('SESSION_INFO');
   // =>log user
   infoLog('user', 'login user with id ' + uid);
   // =>create new session
   const { token, refresh_token } = await SessionModel().add(uid, request.req);
   const expired = new Date();
   expired.setMinutes((new Date()).getMinutes() + session.lifetime);
   // =>set cookie
   request.res.cookie(session.cookieName, token, {
      expires: expired,
      path: session.cookiePath,
      // signed: true, 
   });

   return { token, refresh_token };
}
/******************************************* */
export async function comparePassword(hashedPassword: string, simplePassword: string, replaceSlash = false) {
   if (!simplePassword || !hashedPassword) return false;

   if (replaceSlash) {
      // =>replace '||||' with '/'
      hashedPassword = hashedPassword.replace(/\|\|\|\|/g, '/');
   }

   return await bcrypt.compare(simplePassword, hashedPassword);
}
/******************************************* */
export async function syncUserModel() {
   let session = config<ServerSessionInfo>('SESSION_INFO');
   // =>if custom user model
   if (session.customUserModel) {
      Global.Database.syncModel(session.customUserModel, [], false, false, PATH.join(__dirname, '..', '..', 'app', 'models', session.customUserModel + '.js'));
   }
   // =>if custom session model
   if (session.customSessionModel) {
      Global.Database.syncModel(session.customSessionModel, [], false, false, PATH.join(__dirname, '..', 'app', 'models', session.customSessionModel + '.js'));
   }
}
/******************************************* */
export function userModel<C = typeof CoreUser>(): C {
   // =>if custom model
   if (config<ServerSessionInfo>('SESSION_INFO').customUserModel) {
      return AppModels.find(i => i.name === config<ServerSessionInfo>('SESSION_INFO').customUserModel).class as any;
   }
   // =>if core model
   else {
      return CoreUser as any;
   }
}
/******************************************* */
export function SessionModel<C = typeof CoreSession>(): C {
   // =>if custom model
   if (config<ServerSessionInfo>('SESSION_INFO').customSessionModel) {
      return AppModels.find(i => i.name === config<ServerSessionInfo>('SESSION_INFO').customSessionModel).class as any;
   }
   // =>if core model
   else {
      return CoreSession as any;
   }
}
/******************************************* */
export async function encryptPassword(password: string, saltRounds: string | number = 10, replaceSlash = false) {
   let hash = await bcrypt.hash(password, saltRounds);
   if (replaceSlash) {
      // =>replace '/' with '||||'
      hash = hash.replace(/\//g, '||||');
   }
   return hash;
}
/******************************************* */
export async function logout(uid: number, response: Response) {
   // =>get user session
   const session = await SessionModel().findOne({ where: { uid } });
   // =>remove user session
   if (session) {
      await session.destroy();
   }
   // =>remove cookie
   response.cookie(config<ServerSessionInfo>('SESSION_INFO').cookieName, '', {
      expires: new Date(),
      maxAge: 0,
   });
   return true;

}