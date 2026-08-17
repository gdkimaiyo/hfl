import redis from 'redis';
import { promisify } from 'util';
import environment from '../config/environment';
import Utils from '../utils';

/**
 * Singleton class for Redis caching.
 *
 * This class implements a singleton pattern for RedisCache, ensuring that only one instance of the Redis client exists.
 * It provides methods for interacting with Redis, including saving, fetching, deleting, and flushing cache entries.
 */
class RedisCacheSingleton {
  /**
   * Creates an instance of RedisCacheSingleton.
   * If an instance already exists, it returns the existing one.
   */
  constructor() {
    if (RedisCacheSingleton.exists) {
      return RedisCacheSingleton.instance;
    }
    // Create a Redis client using the environment configuration
    this.client = redis.createClient(environment.REDIS_URL);

    // Promisify Redis methods to work with async/await
    this.client.getAsync = promisify(this.client.get);
    this.client.setAsync = promisify(this.client.set);
    this.client.setexAsync = promisify(this.client.setex);
    this.client.delAsync = promisify(this.client.del);
    this.client.flushallAsync = promisify(this.client.flushall);

    // Singleton instance assignment
    RedisCacheSingleton.instance = this;
    RedisCacheSingleton.exists = this;
  }

  /**
   * Saves a value to the cache by updating the existing object with a new field and value.
   * If the object does not exist, it will be created.
   *
   * @param {string} key - The cache key to save the value under.
   * @param {string} field - The field to add or update in the cache object.
   * @param {any} value - The value to associate with the field.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async save(key, field, value) {
    const currentState = await this.fetch(key);
    if (!currentState) {
      return this.saveObject(key, { [field]: value });
    }
    currentState[field] = value;
    return this.client.setAsync(key, JSON.stringify(currentState));
  }

  /**
   * Fetches a value from the cache asynchronously.
   *
   * @param {string} key - The cache key to fetch the value for.
   * @returns {Promise<any>} A promise that resolves to the cached value, or null if not found.
   */
  async fetch(key) {
    const result = await this.client.getAsync(key);
    return result ? JSON.parse(result) : result;
  }

  /**
   * Saves an object to the cache with a time-to-live (TTL).
   *
   * @param {string} key - The cache key to save the object under.
   * @param {Object} value - The object to store in the cache.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return this.client.setexAsync(key, maxCacheAge, JSON.stringify(value));
  }

  /**
   * Deletes a cache entry by its key.
   *
   * @param {string} key - The cache key to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async delete(key) {
    return this.client.delAsync(key);
  }

  /**
   * Flushes all cache entries, effectively clearing the cache.
   *
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async flush() {
    return this.client.flushallAsync();
  }
}

export default RedisCacheSingleton;
