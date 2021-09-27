import { Middleware as MiddlewareType } from './types';
import * as HTTP from "http";
import * as URL from 'url';
import * as PATH from 'path';
import * as FS from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { debugLog, errorLog, infoLog, config } from "../helpers/server";
import { Middleware } from "./middlewares/middleware";
import { CoreMiddlewares } from "./middlewares/middlewares";
import { AppMiddlewares } from "../../app/middlewares/middlewares";
import { RouteExecuter } from "./route-executer";

export class HttpWebServer {
   server: express.Express;
   responseTime: number;
   // upload = multer({ dest: config('UPLOAD_PATH') }).single('file');
   /**************************************** */
   constructor() {
      // => init server
      this.server = express();
      // =>config middlewares
      this.server.use(cors());
      this.server.use(express.json());
      this.server.use(express.urlencoded({ extended: false }));
      this.server.set('trust proxy', true);

      // =>start to listen to api server
      this.server.listen(config('SERVER_PORT', 8081), () => {
         infoLog('init', `API Web Server Running on ${config('SERVER_PORT', 8081)} port`);
      });
      // =>serve assets files
      // this.server.use(config('PREFIX_URL') + config('ASSETS_URL'), express.static(PATH.join(__dirname, '..', '..', 'resources', 'assets')));
      // =>set public middlewares
      if (config('PUBLIC_MIDDLEWARES')) {
         for (const middle of config('PUBLIC_MIDDLEWARES')) {
            let middleInit = this.loadMiddleware(middle);
            // =>use as middleware
            this.server.use(async (req, res, next) => {
               const stat = await middleInit.handle(req, res);
               if (stat) {
                  next();
               }
            });
            debugLog('middleware', 'init public middleware: ' + middle);

         }
      }
      let commonUrl = '*';
      if (config('PREFIX_URL')) {
         commonUrl = config('PREFIX_URL') + '/' + '*';
      }
      // =>listen on any urls
      this.server.all(commonUrl, (req, res) => new RouteExecuter(req, res));
   }
   /**************************************** */
   // async initPublicMiddlewares()
   /**************************************** */
   loadMiddleware(middle: MiddlewareType) {
      let middleClass: typeof Middleware;
      // =>check middleware is core
      if (CoreMiddlewares.find(i => i.name === middle)) {
         // =>get middleware class
         middleClass = CoreMiddlewares.find(i => i.name === middle).class;
      }
      // =>check middleware is app
      else if (AppMiddlewares.find(i => i.name === middle)) {
         // =>get middleware class
         middleClass = AppMiddlewares.find(i => i.name === middle).class;
      }
      if (!middleClass) return undefined;
      // =>init class
      let middleInit: Middleware = new (middleClass as any)();


      return middleInit;
   }
   /**************************************** */
   // calculateResponseTime() {
   //    if (!this.responseTime) return;
   //    // =>get diff of response
   //    const diff = new Date().getTime() - this.responseTime;
   //    // =>add api calls count
   //    GlobalVariables.SERVER_RESPONSE.apiCalls++;
   //    // =>add response time
   //    GlobalVariables.SERVER_RESPONSE.totalResponseTime += diff;

   //    return diff;
   // }
   /**************************************** */
   // apiResponseV1<T = any>(res: Response, data: APIResponse<T>) {
   //    if (!data) {
   //       data = {
   //          result: undefined,
   //          statusCode: APIStatusCodes.HTTP_200_OK,
   //       };
   //    }
   //    if (!data.statusCode) {
   //       data.statusCode = APIStatusCodes.HTTP_200_OK;
   //    }

   //    res.status(data.statusCode).json({
   //       result: data.result,
   //       statusCode: data.statusCode,
   //       messageName: data.messageName,
   //       paginate: data.paginate,
   //       responseTime: this.calculateResponseTime(),
   //    });
   // }

   /**************************************** */
   // async assetsHandler(req: Request, res: Response, params?: { root?: string, uploaded?: boolean, file_proxy?: boolean }) {
   //    try {
   //       let file: FileProxy;
   //       if (!params) params = {};
   //       // =>get filename
   //       const filename = req.params['filename'];
   //       // =>if file proxy
   //       if (params.file_proxy) {
   //          // =>find filename in files proxy
   //          file = GlobalVariables.FILE_PROXY.find(i => i.filename === filename);
   //          if (file) {
   //             params.root = PATH.dirname(file.path);
   //          }
   //       }
   //       // =>set options
   //       var options = {
   //          root: params.root ? params.root : Settings.ASSETS_PATH,
   //          dotfiles: 'deny',
   //          headers: {
   //             'x-timestamp': Date.now(),
   //             'x-sent': true
   //          }
   //       }
   //       // =>if get uploaded file
   //       if (params.uploaded) {
   //          // console.log(params.root + '/files/' + filename)
   //          res.sendFile('/files/' + filename, options);
   //          return;
   //       }
   //       // =>if file proxy
   //       else if (params.file_proxy && file) {
   //          // console.log(file, params.root, PATH.basename(file.path));
   //          res.sendFile(PATH.basename(file.path), options);
   //          return;
   //       }
   //       // else if (params.file_proxy &&) {
   //       //    // =>find filenmae
   //       //    // =>if 'favicon'
   //       //    if (filename === 'favicon.png' || filename === 'logo.png' || filename === 'logo.svg' || filename === 'favicon-update.png') {
   //       //       // =>check exist new favicon
   //       //       if (FS.existsSync(Settings.ASSETS_PATH + '/logo/new_' + filename)) {
   //       //          res.sendFile('logo/new_' + filename, options);
   //       //       } else {
   //       //          res.sendFile('logo/' + filename, options);
   //       //       }
   //       //       return;
   //       //    }
   //       // }
   //    } catch (e) {
   //       errorLog('err57568', e);
   //       res.status(APIStatusCodes.HTTP_500_INTERNAL_SERVER_ERROR);
   //    }
   //    res.status(APIStatusCodes.HTTP_404_NOT_FOUND);
   //    res.end();
   // }

}