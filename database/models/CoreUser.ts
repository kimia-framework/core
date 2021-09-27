import { DatabaseModel } from '../Model';
import { DataTypes, Model } from 'sequelize';
import { Global } from '../../global';
import { CoreUserModel } from './interfaces';

export class CoreUser extends Model<CoreUserModel> { }


export function load() {
   return CoreUser.init({
      // Model attributes are defined here
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         primaryKey: true,
      },
      username: {
         type: DataTypes.STRING,
         unique: true,
         allowNull: false,
      },
      password: DataTypes.STRING,
      email: {
         type: DataTypes.STRING,
         unique: true,
         allowNull: false,
      },
      avatar: DataTypes.STRING,
      status: DataTypes.SMALLINT,
      sys_access: DataTypes.JSON,
      alias: DataTypes.STRING,
      birth_year: DataTypes.INTEGER,
      email_verified_at: DataTypes.DATE(6),
      security_question: DataTypes.STRING,
      security_answer: DataTypes.STRING,
      settings: DataTypes.JSON,
      expired_at: DataTypes.DATE(6),
      created_at: DataTypes.DATE(6),
      online_at: DataTypes.DATE(6),
      deleted_at: DataTypes.DATE(6),
   }, {
      sequelize: Global.Database.dbConn,
      modelName: 'CoreUser',
      tableName: 'users',
      createdAt: 'created_at',
      updatedAt: false,
      deletedAt: 'deleted_at',
   });
}