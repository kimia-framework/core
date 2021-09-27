import { Model } from "sequelize/types";
import { Plugin } from "../plugins/plugin";
import { PluginName } from "../plugins/types";
import { ApplicationView } from "./application-view";
import { Middleware } from "./middlewares/middleware";
import { ServerRequestType } from "./types";


export interface MiddlewareDefinition<T> {
   name: T;
   class: typeof Middleware;
}

export interface ClassDefinition<T, C, I = object> {
   name: T;
   class: C;
   instance?: I;
}


export interface ViewDefinition<T> extends ClassDefinition<T, typeof ApplicationView> { }

export interface PluginDefinition extends ClassDefinition<PluginName, new (p: PluginName) => Plugin, Plugin> { }

export interface ModelDefinition<T> extends ClassDefinition<T, new () => Model> { }


export interface RequestRouteInfo {
   type: ServerRequestType;
   index: number;
   params: object;
}