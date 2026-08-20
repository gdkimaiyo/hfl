import environment from "../config/environment";
import RedisCacheSingleton from "./redis-cache";
import LRUCacheSingleton from "./lru-cache";

/**
 * Cache instance that switches between Redis or LRU based on environment configuration.
 *
 * If the environment has a valid `REDIS_URL` and it starts with 'redis',
 * RedisCacheSingleton will be used. Otherwise, LRUCacheSingleton is used as a fallback.
 *
 * @type {RedisCacheSingleton|LRUCacheSingleton}
 */
const cache =
  environment.REDIS_URL && environment.REDIS_URL.startsWith("redis")
    ? new RedisCacheSingleton()
    : new LRUCacheSingleton();

export default cache;
