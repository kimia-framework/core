import { LocaleName } from './../data/locales';
import * as FS from 'fs';
import * as PATH from 'path';
import { config, errorLog } from "./server";
import { Global } from '../global';
import { CacheKeys } from '../server/memory-cache';
import { convertMapToObject } from './utils';


export async function translate(key: string, params: object = {}, locale: LocaleName = 'en'): Promise<string> {
   // =>add 'main' filename, if not
   if (key.split('.').length < 2) {
      key = 'main.' + key;
   }
   let fileName = key.split('.')[0];
   let transKeys = key.split('.').slice(1);
   // =>import locale file
   const localeFile = await importLocaleFile(locale, fileName);
   // console.log('trans:', key, transKeys.join('.'), locale, fileName, localeFile);
   if (!localeFile) return transKeys.join('.');
   let value = '';
   // =>return value by key segments
   if (transKeys.length === 1) value = localeFile[transKeys[0]];
   else if (transKeys.length === 2) value = localeFile[transKeys[0]][transKeys[1]];
   else if (transKeys.length === 3) value = localeFile[transKeys[0]][transKeys[1]][transKeys[2]];
   else {
      return transKeys.join('.');
   }
   if (!value) return transKeys.join('.');
   // console.log('translate:' , transKeys, value, params); 
   // =>set params in value 
   if (params && Object.keys(params).length > 0) {
      value = replaceByRegex(value, params);
   }
   return value;
}
/******************************************* */
async function importLocaleFile(locale: LocaleName, filename: string): Promise<{ [k: string]: string }> {
   try {
      let langPath = PATH.join(config('LOCALES_PATH'), locale, filename + '.js');
      const fallbackPath = PATH.join(config('LOCALES_PATH'), config('FALLBACK_LOCALE'), filename + '.js');
      const cacheKey = CacheKeys.localeFile(locale, filename);
      // console.log(langPath)
      // =>check translate file not exist, set fallback lang 
      if (!FS.existsSync(langPath)) {
         langPath = fallbackPath;
      }
      // =>check translate file exist
      if (!FS.existsSync(langPath)) {
         return undefined;
      }
      // =>check file in cache
      if (Global.Cache.getCache(cacheKey)) {
         return Global.Cache.getCache(cacheKey);
      }
      // =>dynamic import file
      const localeFile = await import(langPath);
      // =>store in cache
      const res = Global.Cache.addCache(cacheKey, localeFile['LANG']);
      if (!res) return undefined;
      return localeFile['LANG'];

   } catch (e) {
      errorLog('err4564321', e);
      return undefined;
   }
}
/******************************************* */
function replaceByRegex(text: string, values: object, regex: RegExp = /:\w+/g) {
   // =>if must replace values in translate text
   if (text && values) {
      // =>get all variables of text
      const matches = text.match(regex);
      // console.log('matches:', matches, values);
      // =>replace all variables
      if (Array.isArray(matches)) {
         for (const match of matches) {
            if (values[match.substr(1)] !== undefined) {
               text = text.replace(match, values[match.substr(1)]);
            }
         }
      }
   }
   return text
}