

/**
 * add minutes, hours, days, years to now date time to get expired date time
 * @param unit 
 * @param add 
 * @returns 
 */
export function getExpiredTime(unit: 'second' | 'minute' | 'hour' | 'day' | 'year', add: number) {
   const expired = new Date();
   switch (unit) {
      case 'second':
         expired.setSeconds(expired.getSeconds() + add);
         break;
      case 'minute':
         expired.setMinutes(expired.getMinutes() + add);
         break;
      case 'hour':
         expired.setHours(expired.getHours() + add);
         break;
      case 'day':
         expired.setDate(expired.getDate() + add);
         break;
      case 'year':
         expired.setFullYear(expired.getFullYear() + add);
         break;
   }
   return expired;
}