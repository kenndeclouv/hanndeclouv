const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Suggestion extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        channelId: { type: DataTypes.STRING, allowNull: false },
        messageId: { type: DataTypes.STRING, allowNull: true },
        userId: { type: DataTypes.STRING, allowNull: true },
        content: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, defaultValue: "pending" },
      },
      {
        sequelize,
        modelName: "Suggestion",
        tableName: "suggestions",
        timestamps: true,
      }
    );
  }
}

Suggestion.init(sequelize);

module.exports = Suggestion;
