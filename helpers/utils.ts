

export function convertMapToObject<k = string, v = string>(map: Map<k, v>) {
   let jsonObject: object = {};
   if (!map || map instanceof Map === false) return jsonObject;
   for (const en of map.entries()) {
      jsonObject[en[0] as any] = en[1];
   }

   return jsonObject;
}