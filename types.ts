import { AppModelName } from "../app/models/models";
import { CoreModelName } from "./database/types";
import { CoreKimiaSettings } from "./interfaces";

export type HttpMethod = 'post' | 'get' | 'put' | 'delete';

export type ServerMode = 'production' | 'development';

export enum LogMode {
   INFO = 1,
   ERROR = 2,
   FETAL = 3,
}

export type KimiaSettings<T extends object = {}> = CoreKimiaSettings & ObjectTyped<T>;

export type ObjectTyped<T extends object = {}> = {
   [K in keyof T]?: T[K]
}

export type ModelName = CoreModelName | AppModelName;