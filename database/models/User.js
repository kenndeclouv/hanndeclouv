const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class User extends CacheableModel {
  static DEFAULT_TTL = 600000; // 10 menit
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        level: { type: DataTypes.INTEGER, defaultValue: 1 },
        xp: { type: DataTypes.INTEGER, defaultValue: 1 },
        cash: { type: DataTypes.INTEGER, defaultValue: 0 },
        bank: { type: DataTypes.INTEGER, defaultValue: 0 },
        bankType: { type: DataTypes.STRING, defaultValue: "bca" },
        hackMastered: { type: DataTypes.INTEGER, defaultValue: 10, max: 100 },
        careerMastered: { type: DataTypes.INTEGER, defaultValue: 1, max: 10 },
        lastDaily: { type: DataTypes.DATE, defaultValue: null },
        lastBeg: { type: DataTypes.DATE, defaultValue: null },
        lastLootbox: { type: DataTypes.DATE, defaultValue: null },
        lastWork: { type: DataTypes.DATE, defaultValue: null },
        lastRob: { type: DataTypes.DATE, defaultValue: null },
        lastHack: { type: DataTypes.DATE, defaultValue: null },
        lastMessage: { type: DataTypes.DATE, defaultValue: null },
        warnings: { type: DataTypes.JSON, defaultValue: "[]" },

        nsfwCount: { type: DataTypes.INTEGER, defaultValue: "0" },
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: false,
      }
    );
  }
}

User.init(sequelize);

module.exports = User;
