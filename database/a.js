/**
 * 🎮 CacheableModel - Sequelize Model dengan fitur caching
 *
 * Model dasar yang memperluas Sequelize Model dengan sistem caching otomatis.
 * Mendukung operasi find dengan cache, update cache, dan invalidation.
 * Cocok untuk data yang sering diakses tapi jarang berubah.
 *
 * @class CacheableModel
 * @extends Model
 * @copyright © 2025 kenndeclouv
 * @author chaadeclouv
 */
const { Model } = require("sequelize");

class CacheableModel extends Model {
  static cache = new Map();
  /**
   * Mendapatkan record dari cache/database (findOne)
   * @param {Object|Object[]} keys - Kriteria pencarian (bisa objek tunggal atau array)
   * @returns {Promise<Model|Model[]|null>} Hasil pencarian
   * @example
   * // Single key
   * await User.getCache({ id: 123 });
   *
   * // Multiple keys
   * await User.getCache([{ id: 1 }, { id: 2 }]);
   */
  static async getCache(keys) {
    if (Array.isArray(keys)) {
      const results = [];

      for (const keyObj of keys) {
        const cacheKey = Object.entries(keyObj)
          .map(([k, v]) => `${k}:${v}`)
          .join(":");

        if (this.cache.has(cacheKey)) {
          results.push(this.cache.get(cacheKey));
        } else {
          const record = await this.findOne({ where: keyObj });
          if (record) {
            this.cache.set(cacheKey, record);
            results.push(record);
          } else {
            results.push(null);
          }
        }
      }

      return results;
    } else if (typeof keys === "object") {
      const arrayFields = Object.entries(keys).filter(([_, v]) => Array.isArray(v));

      if (arrayFields.length > 0) {
        // Kalau ada field array, berarti where pakai IN
        const where = {};

        for (const [key, value] of Object.entries(keys)) {
          if (Array.isArray(value)) {
            where[key] = value;
          } else {
            where[key] = value;
          }
        }

        const records = await this.findAll({ where });

        // Cache-in semua record yang didapat
        for (const record of records) {
          const cacheKey = Object.entries(keys)
            .map(([k, v]) => {
              if (Array.isArray(v)) {
                return `${k}:${record[k]}`; // Ambil value dari record
              } else {
                return `${k}:${v}`;
              }
            })
            .join(":");
          this.cache.set(cacheKey, record);
        }

        return records;
      } else {
        // Normal single object
        const cacheKey = Object.entries(keys)
          .map(([k, v]) => `${k}:${v}`)
          .join(":");

        if (this.cache.has(cacheKey)) {
          return this.cache.get(cacheKey);
        }

        const record = await this.findOne({ where: keys });
        if (record) {
          this.cache.set(cacheKey, record);
        }
        return record;
      }
    } else {
      throw new Error("Invalid key format, must be object or array of objects");
    }
  }
  /**
   * Mendapatkan semua record yang sesuai (findAll)
   * @param {Object|Object[]} keys - Kriteria pencarian
   * @returns {Promise<Model[]>} Array hasil pencarian
   * @example
   * // Cari semua user dengan status aktif
   * await User.getAllCache({ status: 'active' });
   */
  static async getAllCache(keys) {
    if (Array.isArray(keys)) {
      // Banyak conditions
      const results = [];

      for (const keyObj of keys) {
        const cacheKey = Object.entries(keyObj)
          .map(([k, v]) => `${k}:${v}`)
          .join(":");

        if (this.cache.has(cacheKey)) {
          results.push(this.cache.get(cacheKey));
        } else {
          const records = await this.findAll({ where: keyObj });
          this.cache.set(cacheKey, records);
          results.push(records);
        }
      }

      return results.flat();
    } else if (typeof keys === "object") {
      const arrayFields = Object.entries(keys).filter(([_, v]) => Array.isArray(v));

      if (arrayFields.length > 0) {
        // Ada IN query
        const where = {};

        for (const [key, value] of Object.entries(keys)) {
          if (Array.isArray(value)) {
            where[key] = value;
          } else {
            where[key] = value;
          }
        }

        const records = await this.findAll({ where });

        // Cache-in semua individually
        for (const record of records) {
          const cacheKey = Object.entries(keys)
            .map(([k, v]) => {
              if (Array.isArray(v)) {
                return `${k}:${record[k]}`;
              } else {
                return `${k}:${v}`;
              }
            })
            .join(":");
          this.cache.set(cacheKey, record);
        }

        return records;
      } else {
        // Normal single where
        const cacheKey = Object.entries(keys)
          .map(([k, v]) => `${k}:${v}`)
          .join(":");

        if (this.cache.has(cacheKey)) {
          return this.cache.get(cacheKey);
        }

        const records = await this.findAll({ where: keys });
        this.cache.set(cacheKey, records);
        return records;
      }
    } else {
      throw new Error("Invalid key format, must be object or array of objects");
    }
  }
  /**
   * Update record dan update cache
   * @param {string} keyField - Nama field primary key
   * @param {*} keyValue - Nilai primary key
   * @param {Object} newData - Data baru untuk diupdate
   * @returns {Promise<Model>} Record yang telah diupdate
   */
  static async updateCache(keyField, keyValue, newData) {
    const cacheKey = `${keyField}:${keyValue}`;
    const [record, created] = await this.findOrCreate({
      where: { [keyField]: keyValue },
      defaults: newData,
    });

    if (!created) await record.update(newData);
    this.cache.set(cacheKey, record);
    return record;
  }
  /**
   * Membersihkan cache untuk key tertentu
   * @param {string} keyField - Nama field
   * @param {*} keyValue - Nilai field
   */
  static clearCache(keyField, keyValue) {
    const cacheKey = `${keyField}:${keyValue}`;
    this.cache.delete(cacheKey);
  }
  /**
   * Simpan perubahan instance dan update cache
   * @param {string} keyField - Field yang digunakan sebagai cache key
   * @returns {Promise<Model>} Instance saat ini
   */
  async saveAndUpdateCache(keyField = "id") {
    await this.save();
    const cacheKey = `${keyField}:${this[keyField]}`;
    this.constructor.cache.set(cacheKey, this);
    return this;
  }
}

module.exports = CacheableModel;
