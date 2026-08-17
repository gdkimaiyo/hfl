import cache from '../cache';

/**
 * Helper class for performing startup-related tasks.
 *
 * This class includes methods for managing stale cache during the startup process
 * and registering event handlers that can be used to manage application events.
 */
class StartUpHelper {
  /**
   * Flushes stale cache from the cache system.
   *
   * This method is useful for clearing out old or invalid data stored in the cache
   * at the start of the application to ensure that fresh data is used.
   *
   * @returns {Promise<void>} A promise that resolves when the cache flush operation is complete.
   */
  static async flushStaleCache() {
    await cache.flush();
  }

  /**
   * Registers event handlers for various application events.
   *
   * This method is intended to register all event handlers needed during the startup.
   * Currently, it does not have any implemented logic, but it can be extended for
   * managing custom event handlers such as logging, initialization, etc.
   */
  static registerEventHandlers() {}
}

export default StartUpHelper;
