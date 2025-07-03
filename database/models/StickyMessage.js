const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class StickyMessage extends CacheableModel {
  static DEFAULT_TTL = 600000; // 10 menit
  static init(sequelize) {
    super.init(
      {
        channelId: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.STRING, allowNull: false },
        messageId: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: "StickyMessage",
        tableName: "sticky_messages",
        timestamps: false,
      }
    );
  }
}

StickyMessage.init(sequelize);

module.exports = StickyMessage;
