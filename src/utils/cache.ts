import NodeCache from 'node-cache';

// Cache TTL of 1 hour for exercise data
const cache = new NodeCache({ stdTTL: 3600 });

export const getCached = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

export const setCache = <T>(key: string, data: T): void => {
  cache.set(key, data);
};

export default cache;