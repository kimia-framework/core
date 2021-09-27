import { getExpiredTime } from "../helpers/data-time";
import { stringBytesCount } from '../helpers/string';
import { infoLog, config } from "../helpers/server";
import { MemoryCacheInfo, MemoryCacheItem } from "../interfaces";
import { LocaleName } from "../data/locales";


export class MemoryCache {

   protected __cache: MemoryCacheItem[] = [];
   protected allocatedSize = 0; // bytes
   protected memorySettings: MemoryCacheInfo;
   /**************************************** */
   constructor() {
      // =>load settings
      this.memorySettings = config('MEMORY_CACHE_INFO');
   }
   /**************************************** */
   /**
    * 
    * @param key 
    * @param value 
    * @param force : must be cached this item,if not any more space!
    * @param expired : expired in x minutes later (-1 not expired anyway!)
    * @returns 
    */
   addCache<T = any>(key: number | string, value: T, force = false, expired?: number) {
      this.checkCacheExpired();
      // =>set expired
      if (expired === undefined || expired === null) {
         expired = this.memorySettings.memoryCacheExpired;
      }
      if (expired > -1) {
         expired = getExpiredTime('minute', expired).getTime()
      }
      // =>calc value size
      const valueSize = stringBytesCount(JSON.stringify(value));
      // =>try ot find cache
      const exist = this.getCache<T>(key, undefined);
      // =>update cache
      if (exist !== undefined) {
         const ind = this.__cache.findIndex(i => i.key === key);
         if (ind < 0) return false;
         // =>update allocate size
         this.allocatedSize -= this.__cache[ind].size;
         this.allocatedSize += valueSize;
         // =>update cache item
         this.__cache[ind].value = value;
         this.__cache[ind].expired_in = expired;
         this.__cache[ind].size = valueSize;
      }
      // =>add to cache
      else {
         // =>check max cache size
         if (!force && this.allocatedSize > this.memorySettings.maxMemoryCacheSize) return false;
         // =>add item to cache
         this.__cache.push({
            key,
            value,
            expired_in: expired,
            size: valueSize,
         });
         // =>update allocated size
         this.allocatedSize += valueSize;
      }
      infoLog(`memory cache size: ${this.allocatedSize / 1000}KB / ${this.memorySettings.maxMemoryCacheSize / 1000} KB`, 'cache');
      return true;
   }
   /**************************************** */
   getCache<T = any>(key: number | string, def?: T): T {
      // =>find cache
      const item = this.__cache.find(i => i.key === key);
      if (item) return item.value;
      return def;
   }
   /**************************************** */
   removeCache(key?: number | string) {
      // =>remove cached with collection id, key
      if (key !== undefined) {
         // =>find cache
         const index = this.__cache.findIndex(i => i.key === key);
         if (index < 0) return false;
         // =>update allocated size
         this.allocatedSize -= this.__cache[index].size;
         // =>remove item
         this.__cache.splice(index, 1);
      }
      // =>remove all cached with collection id
      else {
         while (true) {
            // =>find cache
            const index = this.__cache.findIndex(i => i.key);
            if (index < 0) break;
            // =>update allocated size
            this.allocatedSize -= this.__cache[index].size;
            // =>remove item
            this.__cache.splice(index, 1);
         }
      }
      return true;
   }
   /**************************************** */
   checkCacheExpired() {
      const now = new Date().getTime();
      while (true) {
         let exist = false;
         // =>iterate cache items
         for (let i = 0; i < this.__cache.length; i++) {
            // =>check if expired is -1
            if (this.__cache[i].expired_in === -1) continue;
            // =>check expired time of cache
            if (this.__cache[i].expired_in < now) {
               exist = true;
               this.allocatedSize -= this.__cache[i].size;
               this.__cache.splice(i, 1);
            }
         }
         if (!exist) break;
      }
   }
   /**************************************** */
   getCacheAllocatedSize() {
      return this.allocatedSize;
   }
   /**************************************** */
   showAllCache() {
      console.log(this.__cache);
   }
   /**************************************** */
   removeAllCache() {
      this.__cache = [];
      this.allocatedSize = 0;
      infoLog('cache', 'removed all cache');
   }

}


export namespace CacheKeys {
   export function localeFile(lang: LocaleName, name: string) {
      return '_locale_file_' + lang + '_' + name + '_';
   }
   /************************************** */
}