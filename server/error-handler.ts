import { Global } from '../global';
import { debugLog } from '../helpers/server';
import { CoreRequest } from './request';
import { HttpStatusCode } from './types';


export class HttpErrorHandler {

   request: CoreRequest;
   /**************************************** */
   async switchHandler(request: CoreRequest, code: HttpStatusCode = HttpStatusCode.HTTP_404_NOT_FOUND, data?: string | object) {
      this.request = request;
      debugLog('error', `http ${code} error for '${request.requestType}' with data: ${data}`);
      if (typeof data === 'string') {
         data = { data };
      }

      if (request.requestType === 'web') {
         return await this.webHandler(code, data);
      } else if (request.requestType === 'api') {
         return await this.apiHandler(code, data);
      }
   }
   /**************************************** */
   async webHandler(code: HttpStatusCode = HttpStatusCode.HTTP_404_NOT_FOUND, data?: any) {
      if (data && typeof data === 'object') {
         data = JSON.stringify(data);
      } else if (data === undefined) {
         data = '';
      }
      return this.request.response(`
      <h1>${code} Error!</h1><hr>
      <p><code>${data}</code></p>
      `, code);
   }
   /**************************************** */
   async apiHandler(code: HttpStatusCode = HttpStatusCode.HTTP_404_NOT_FOUND, data?: any) {
      //TODO:
      // request.response(code + ' Error!', code);
   }
   /**************************************** */
   async render(name: string, params: object = {}) {
      return await Global.TemplateLoader.render(this.request, name, params);
   }
}
