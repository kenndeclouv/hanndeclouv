/**
 * 🎮 CacheableModel - Sequelize Model dengan sistem caching canggih
 *
 * @file models/CacheableModel.js
 * @copyright © 2025 kenndeclouv
 * @author chaadeclouv
 * @version 2.0.0
 *
 * Fitur Utama:
 * - Caching otomatis dengan TTL
 * - Concurrency control
 * - Error handling terstruktur
 * - Cache invalidation
 * - Pagination support
 * - Metrics tracking
 * - Composite key support
 */

const { Model, Op } = require("sequelize");
const { DatabaseError, CacheError } = require("./errors");
const jsonStringify = require("json-stable-stringify");

class CacheableModel extends Model {
  static cache = new Map();
  static pendingQueries = new Map();
  static cacheStats = { hits: 0, misses: 0 };
  static DEFAULT_TTL = 3600000; // 1 jam dalam ms
  static MAX_CACHE_SIZE = 1000;

  /**
   * Generate composite cache key dengan sorting
   * @param {Object} keys - Kriteria pencarian
   * @returns {string} Cache key
   */
  // static getCacheKey(keys) {
  //   return Object.entries(keys)
  //     .sort((a, b) => a[0].localeCompare(b[0]))
  //     .map(([k, v]) => `${k}_${v}`)
  //     .join("|");
  // }
  static getCacheKey(keys) {
    const normalized = this.normalizeWhereClause(keys);
    return jsonStringify(normalized);
  }

  /**
   * Normalisasi where clause untuk serialisasi konsisten
   */
  static normalizeWhereClause(where) {
    const processValue = (value) => {
      if (value && typeof value === "object" && value[Op]) {
        return Object.keys(value).reduce((acc, op) => {
          acc[`$${op}`] = processValue(value[op]);
          return acc;
        }, {});
      }
      return value;
    };

    return Object.keys(where)
      .sort()
      .reduce((acc, key) => {
        acc[key] = processValue(where[key]);
        return acc;
      }, {});
  }
  /**
   * Improved getAllCache dengan auto-invalidation
   */
  static async getAllCache(whereCondition = {}, options = {}) {
    const cacheKey = jsonStringify({
      queryType: "findAll",
      where: this.normalizeWhereClause(whereCondition),
      options,
    });

    const cached = this.getCachedEntry(cacheKey);
    if (cached) return cached;

    const records = await this.findAll({
      where: whereCondition,
      ...options,
    });

    // Update cache untuk individual items
    const individualKeys = [];
    for (const record of records) {
      const individualKey = { [this.primaryKeyAttribute]: record[this.primaryKeyAttribute] };
      const individualCacheKey = this.getCacheKey(individualKey);

      this.cache.set(individualCacheKey, {
        data: record,
        expires: Date.now() + this.DEFAULT_TTL,
        queries: [cacheKey],
      });

      individualKeys.push(individualCacheKey);
    }

    // Simpan query cache
    this.cache.set(cacheKey, {
      data: records,
      expires: Date.now() + this.DEFAULT_TTL,
      dependencies: individualKeys,
    });

    return records;
  }
  /**
   * Handler cache expiration
   */
  static checkExpiration() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cached entry atau null jika expired
   * @param {string} cacheKey - Kunci cache
   * @returns {?object} Cache entry
   */
  static getCachedEntry(cacheKey) {
    this.checkExpiration();

    if (this.cache.has(cacheKey)) {
      this.cacheStats.hits++;
      return this.cache.get(cacheKey).data;
    }

    this.cacheStats.misses++;
    return null;
  }

  /**
   * Get single/multiple records dengan cache
   * @param {Object|Object[]} keys - Kriteria pencarian
   * @returns {Promise<Model|Model[]|null>} Hasil query
   */
  static async getCache(keys) {
    try {
      this.validateKeys(keys);

      if (Array.isArray(keys)) {
        return this.handleBatchGet(keys);
      }
      return this.handleSingleGet(keys);
    } catch (error) {
      console.error("Cache error:", error);
      // Fallback ke database
      return Array.isArray(keys) ? this.findAll({ where: { [Op.or]: keys } }) : this.findOne({ where: keys });
    }
  }

  /**
   * Handle single get operation
   */
  static async handleSingleGet(keys) {
    const cacheKey = this.getCacheKey(keys);

    if (this.pendingQueries.has(cacheKey)) {
      return this.pendingQueries.get(cacheKey);
    }

    try {
      const cached = this.getCachedEntry(cacheKey);
      if (cached) return cached;

      const queryPromise = this.findOne({ where: keys })
        .then((record) => {
          if (record) {
            this.cache.set(cacheKey, {
              data: record,
              expires: Date.now() + this.DEFAULT_TTL,
            });
            this.enforceCacheSizeLimit();
          }
          return record;
        })
        .catch((err) => {
          this.cache.delete(cacheKey);
          throw new DatabaseError("Query failed", { cause: err });
        });

      this.pendingQueries.set(cacheKey, queryPromise);
      return await queryPromise;
    } finally {
      this.pendingQueries.delete(cacheKey);
    }
  }

  /**
   * Handle batch get operations
   */
  static async handleBatchGet(keysArray) {
    const results = [];
    const dbQueries = [];

    for (const [index, keys] of keysArray.entries()) {
      const cacheKey = this.getCacheKey(keys);
      const cached = this.getCachedEntry(cacheKey);

      if (cached) {
        results[index] = cached;
      } else {
        results[index] = null;
        dbQueries.push({ index, keys, cacheKey });
      }
    }

    if (dbQueries.length > 0) {
      const dbResults = await this.findAll({
        where: { [this.primaryKeyAttribute]: dbQueries.map((q) => q.keys[this.primaryKeyAttribute]) },
      });

      for (const { index, keys, cacheKey } of dbQueries) {
        const record = dbResults.find((r) => r[this.primaryKeyAttribute] === keys[this.primaryKeyAttribute]);

        if (record) {
          this.cache.set(cacheKey, {
            data: record,
            expires: Date.now() + this.DEFAULT_TTL,
          });
          results[index] = record;
        }
      }
    }

    return results;
  }

  /**
   * 🎯 getAllCache - Untuk ambil SEMUA record yang match kriteria + cache per item
   * @param {Object} whereCondition - Kondisi pencarian (bisa pakai operator Sequelize)
   * @returns {Promise<Model[]>}
   *
   * Contoh penggunaan:
   * // Cari semua user aktif
   * const users = await User.getAllCache({
   *   status: 'active',
   *   age: { [Op.gt]: 18 }
   * });
   */
  static async updateCache(keyField, keyValue, newData) {
    const individualKey = { [keyField]: keyValue };
    const individualCacheKey = this.getCacheKey(individualKey);

    // Dapatkan queries yang tergantung
    const dependentQueries = this.cache.get(individualCacheKey)?.queries || [];

    try {
      const result = await super.update(newData, { where: individualKey });

      // Invalidate cache terkait
      this.clearCache(individualKey);
      dependentQueries.forEach((queryKey) => this.clearCache(queryKey));

      return result;
    } catch (err) {
      this.clearCache(individualKey);
      throw new DatabaseError("Update failed", { cause: err });
    }
  }
  /**
   * Clear cache entry
   */
  static clearCache(keys) {
    const cacheKey = this.getCacheKey(keys);
    this.cache.delete(cacheKey);
  }

  /**
   * Simpan instance dan update cache
   */

  async saveAndUpdateCache(keyField = this.constructor.primaryKeyAttribute) {
    const instance = await this.save();
    const cacheKey = this.constructor.getCacheKey({
      [keyField]: instance[keyField],
    });

    // Update cache untuk semua query terkait
    this.constructor.cache.set(cacheKey, {
      data: instance,
      expires: Date.now() + this.constructor.DEFAULT_TTL,
    });

    return instance;
  }
  /**
   * Paginated query dengan cache
   */
  static async getPaginatedCache(keys, page = 1, limit = 10) {
    const cacheKey = `${this.getCacheKey(keys)}_page_${page}_limit_${limit}`;
    const cached = this.getCachedEntry(cacheKey);

    if (cached) return cached;

    const result = await this.findAll({
      where: keys,
      offset: (page - 1) * limit,
      limit,
      order: [[this.primaryKeyAttribute, "ASC"]],
    });

    this.cache.set(cacheKey, {
      data: result,
      expires: Date.now() + this.DEFAULT_TTL,
    });

    return result;
  }

  /**
   * Helper Methods
   */
  static validateKeys(keys) {
    if (!Array.isArray(keys) && typeof keys !== "object") {
      throw new CacheError("Invalid keys format");
    }
  }

  static enforceCacheSizeLimit() {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].expires - b[1].expires);

      for (let i = 0; i < entries.length - this.MAX_CACHE_SIZE; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Hooks untuk auto-cache invalidation
   */
  static initializeCacheHooks() {
    this.addHook("afterDestroy", (instance) => {
      this.clearCache({ [this.primaryKeyAttribute]: instance[this.primaryKeyAttribute] });
    });

    this.addHook("afterUpdate", (instance) => {
      const cacheKey = this.getCacheKey({ [this.primaryKeyAttribute]: instance[this.primaryKeyAttribute] });
      this.cache.set(cacheKey, {
        data: instance,
        expires: Date.now() + this.DEFAULT_TTL,
      });
    });
  }
}

module.exports = CacheableModel;