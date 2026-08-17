import { LRUCache } from 'lru-cache';
import Utils from '../utils';

/**
 * Options for configuring cache expiration in LRUCache.
 * @param {number} maxAgeInMinutes - The maximum age in minutes for cache items.
 * @returns {Object} The options for the cache with TTL in seconds.
 */
export const cacheOptions = (maxAgeInMinutes) => ({
  maxAge: Utils.convertMinutesToSeconds(maxAgeInMinutes),
});
/**
 * Singleton class for LRU (Least Recently Used) caching.
 *
 * This class implements a singleton pattern for LRUCache, ensuring that only one instance of the cache exists.
 * It provides methods for interacting with the cache, including saving, fetching, deleting, and flushing cache entries.
 */
class LRUCacheSingleton {
  /**
   * Creates an instance of the LRUCacheSingleton.
   * If an instance already exists, it returns the existing one.
   *
   * @param {number} [maxAgeInMinutes=5] - The cache expiration time in minutes. Default is 5 minutes.
   */
  constructor(maxAgeInMinutes = 5) {
    if (LRUCacheSingleton.exists) {
      return LRUCacheSingleton.instance;
    }

    // Initialize the LRUCache instance
    this.cache = new LRUCache({
      max: 100, // Example max items
      ttl: maxAgeInMinutes * 60 * 1000, // Time-to-live in milliseconds
    });

    // Singleton instance assignment
    LRUCacheSingleton.instance = this;
    LRUCacheSingleton.exists = this;
  }

  /**
   * Retrieves a value from the cache asynchronously.
   *
   * @param {string} key - The cache key to retrieve the value for.
   * @returns {Promise<any>} A promise that resolves to the cached value.
   */
  getAsync(key) {
    return new Promise((resolve, reject) => {
      try {
        const result = this.cache.get(key);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Saves a value to the cache, updating the existing object with a new field and value.
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
    return this.cache.set(key, currentState);
  }

  /**
   * Fetches a value from the cache asynchronously.
   *
   * @param {string} key - The cache key to fetch the value for.
   * @returns {Promise<any>} A promise that resolves to the cached value.
   */
  async fetch(key) {
    const result = await this.getAsync(key);
    return result;
  }

  /**
   * Saves an object to the cache.
   *
   * @param {string} key - The cache key to save the object under.
   * @param {Object} value - The object to store in the cache.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return new Promise((resolve, reject) => {
      try {
        const data = this.cache.set(key, value, maxCacheAge);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Deletes a cache entry by its key.
   *
   * @param {string} key - The cache key to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async delete(key) {
    return new Promise((resolve, reject) => {
      try {
        this.cache.del(key);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Flushes all cache entries, effectively clearing the cache.
   *
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async flush() {
    return new Promise((resolve, reject) => {
      try {
        this.cache.reset();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default LRUCacheSingleton;
