/**
 * Hash Generator Utility
 * 
 * This utility provides functions to generate hashes for caching purposes,
 * particularly for AI insight parameters.
 */

import crypto from 'crypto';

/**
 * Generates a hash from an object for caching purposes
 * 
 * @param obj - The object to hash
 * @returns A string hash representation of the object
 */
export const generateParameterHash = (obj: Record<string, any>): string => {
  // Sort keys to ensure consistent hashing regardless of property order
  const sortedObj = sortObjectKeys(obj);
  
  // Convert to string and hash
  const objString = JSON.stringify(sortedObj);
  return crypto.createHash('md5').update(objString).digest('hex');
};

/**
 * Recursively sorts object keys for consistent stringification
 * 
 * @param obj - The object to sort keys for
 * @returns A new object with sorted keys
 */
const sortObjectKeys = (obj: any): any => {
  // Handle non-objects
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  // Handle objects
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
};

export default {
  generateParameterHash
};
