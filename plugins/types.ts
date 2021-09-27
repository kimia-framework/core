import { PluginDefinition } from "../server/interfaces";
import { JSZip } from "./js-zip";
import { NodeMailer } from "./node-mailer";


export type PluginName = 'nodeMailer' | 'jsZip';

export const Plugins: PluginDefinition[] = [
   {
      name: 'nodeMailer',
      class: NodeMailer,
   },
   {
      name: 'jsZip',
      class: JSZip,
   },
];