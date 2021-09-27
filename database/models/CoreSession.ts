import { ServerSessionInfo } from './../../session/interfaces';
import { Request } from 'express';
import { DataTypes, Model } from 'sequelize';
import { Global } from '../../global';
import { config, errorLog } from '../../helpers/server';
import { generateString } from '../../helpers/string';
import { DatabaseModel } from './../Model';
import { CoreSessionModel } from './interfaces';

export class CoreSession extends Model<CoreSessionModel> {
   static async add(uid: number, req: Request) {
      try {
         const now = new Date();
         const expired = new Date();
         expired.setMinutes(now.getMinutes() + config<ServerSessionInfo>('SESSION_INFO').lifetime);
         const token = generateString(20);
         const refresh_token = generateString(40);
         // =>create new session
         await CoreSession.create({
            uid,
            ip: req.ip,
            user_agent: req.get('user-agent'),
            created_at: now.getTime(),
            token,
            refresh_token,
            expired_token_at: expired.getTime(),
         });
         return { token, refresh_token };
      } catch (e) {
         errorLog('err5454', e);
         return { token: null, refresh_token: null };
      }
   }
   /*************************************** */
   static async updateToken(session: CoreSession) {
      const now = new Date();
      const expired = new Date();
      expired.setMinutes(now.getMinutes() + config<ServerSessionInfo>('SESSION_INFO').lifetime);
      const token = generateString(20);
      // =>update session
      session.setDataValue('refresh_token_at', new Date().getTime());
      session.setDataValue('token', token);
      session.setDataValue('expired_token_at', expired.getTime());
      await session.save();
      return token;
   }
   /*************************************** */
   static async find(token: string) {
      // =>find session by token
      const session = await CoreSession.findOne({ where: { token } });
      if (!session) {
         return undefined;
      }
      return session;
   }
}


export function load() {
   return CoreSession.init({
      // Model attributes are defined here
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         primaryKey: true,
      },
      uid: {
         type: DataTypes.BIGINT,
         allowNull: false,
      },
      ip: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      user_agent: DataTypes.STRING,
      token: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      refresh_token: DataTypes.STRING,
      checked_token_at: DataTypes.DATE(6), // last check token datetime
      expired_token_at: DataTypes.DATE(6),
      refresh_token_at: DataTypes.DATE(6),
      created_at: DataTypes.DATE(6),
   }, {
      sequelize: Global.Database.dbConn,
      modelName: 'Session',
      tableName: 'sessions',
      createdAt: 'created_at',
      updatedAt: false,
      deletedAt: false,
   });
}