import { DataTypes, Model } from 'sequelize';
import { Global } from '../../global';
import { LogMode } from '../../types';
import { DatabaseModel } from './../Model';
import { CoreLogModel } from './interfaces';

export class CoreLog extends Model<CoreLogModel> { }


export function load() {
   return CoreLog.init({
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         primaryKey: true,
      },
      namespace: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      uid: DataTypes.BIGINT,
      ip: DataTypes.STRING,
      var1: DataTypes.STRING(255),
      var2: DataTypes.STRING(400),
      mode: {
         type: DataTypes.SMALLINT,
         defaultValue: LogMode.INFO,
      },
      created_at: DataTypes.DATE(6),
   }, {
      sequelize: Global.Database.dbConn,
      modelName: 'CoreLog',
      tableName: 'logs',
      createdAt: 'created_at',
      updatedAt: false,
      deletedAt: false,
   });
}