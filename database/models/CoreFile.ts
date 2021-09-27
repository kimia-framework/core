import { DatabaseModel } from '../Model';
import { DataTypes, Model } from 'sequelize';
import { Global } from '../../global';
import { CoreFileModel } from './interfaces';

export class CoreFile extends Model<CoreFileModel> { }


export function load() {
   return CoreFile.init({
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         primaryKey: true,
      },
      filename: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      path: {
         type: DataTypes.STRING(400),
         allowNull: false,
      },
      original_name: DataTypes.STRING,
      mime_type: DataTypes.STRING,
      size: {
         type: DataTypes.BIGINT, // bytes
         defaultValue: 0,
      },
      created_at: DataTypes.DATE(6),
      created_by: DataTypes.BIGINT,
      deleted_at: DataTypes.DATE(6),
   }, {
      sequelize: Global.Database.dbConn,
      modelName: 'CoreFile',
      tableName: 'files',
      createdAt: 'created_at',
      updatedAt: false,
      deletedAt: 'deleted_at',
   });
}