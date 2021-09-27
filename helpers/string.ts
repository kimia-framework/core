

export function generateString(length = 10, includeNumbers = true, includeChars = true) {
   var result = '';
   var characters = '';
   if (includeChars) {
      characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   }
   if (includeNumbers) {
      characters += '0123456789';
   }
   if (!includeChars && !includeNumbers) {
      characters += '-';
   }
   var charactersLength = characters.length;
   for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
/****************************************** */
/**
 * calculate string length as bytes
 * @param str 
 * @returns 
 */
export function stringBytesCount(str: string) {
   // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
   const m = encodeURIComponent(str).match(/%[89ABab]/g);
   return str.length + (m ? m.length : 0);
}
