import { DataType, Model, ModelAttributeColumnOptions, ModelAttributes, ModelStatic } from "sequelize";

export type DatabaseModelStatic<M extends DatabaseModel> = { new(): M };

export class DatabaseModel<T extends {} = {}> extends Model<T, T> {
   // modelName: string;
   // tableName: string;
   // attributes: { [name in keyof T]: ModelAttributeColumnOptions };
   // extraAttributes?: { [name in keyof T]?: ModelAttributeColumnOptions };

   // protected _modelInstance: typeof Model;
   /*************************************** */
   static query(this: DatabaseModel) {

   }
   /*************************************** */
   constructor() {
      super();
   }
   /*************************************** */
   public static load<M extends DatabaseModel>(
      this: DatabaseModelStatic<M>,
      attributes: ModelAttributes<M, M['_attributes']>
   ) {
      console.log(this)
   }
}