import { debugLog, errorLog, infoLog } from "../helpers/server";
import { PluginName, Plugins } from "./types";

export abstract class Plugin<T = {}> {
   protected config: T;
   protected name: PluginName;
   protected version = 1;
   /*************************************** */
   constructor(name: PluginName) {
      this.name = name;
   }
   /*************************************** */
   abstract checkRequirements(): Promise<boolean>;
   /*************************************** */
   abstract requirementsInfo(): string;
   /*************************************** */
   abstract init(): Promise<boolean>;
   /*************************************** */
   async setConfig(config: T): Promise<boolean> {
      this.config = config;
      return true;
   }
   /*************************************** */
   getConfig(): T {
      return this.config;
   }
   /*************************************** */
   getVersion() {
      return this.version;
   }
   /*************************************** */
   protected infoLog(text: string) {
      infoLog(this.name, text);
   }
   /*************************************** */
   protected debugLog(text: string) {
      debugLog(this.name, text);
   }
   /*************************************** */
   protected errorLog(text: string) {
      errorLog('err134-' + this.name, text);
   }
   /*************************************** */
   /*************************************** */
   /*************************************** */
   static plugin<T = Plugin>(name: PluginName): T {
      const plug = Plugins.find(i => i.name === name);
      if (!plug || !plug.instance) return undefined;

      return plug.instance as any;
   }
}