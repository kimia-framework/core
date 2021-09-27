import { RequestInit } from './RequestInit';
import { StaticFiles } from './StaticFiles';
import { RoutingResolver } from './RoutingResolver';
import { MiddlewareDefinition } from "../interfaces";
import { CoreMiddleware } from "../types";
import { XPoweredBy } from "./XPoweredBy";
import { Authentication } from './Authentication';
import { SessionCookie } from './SessionCookie';
import { UploadFile } from './UploadFile';


export const CoreMiddlewares: MiddlewareDefinition<CoreMiddleware>[] = [
   {
      name: 'XPoweredBy',
      class: XPoweredBy,
   },
   {
      name: 'RoutingResolver',
      class: RoutingResolver,
   },
   {
      name: 'RoutingResolver',
      class: RoutingResolver,
   },
   {
      name: 'StaticFiles',
      class: StaticFiles,
   },
   {
      name: 'RequestInit',
      class: RequestInit,
   },
   {
      name: 'Authentication',
      class: Authentication,
   },
   {
      name: 'SessionCookie',
      class: SessionCookie,
   },
   {
      name: 'UploadFile',
      class: UploadFile,
   },
];