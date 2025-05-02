const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // Adjust connection string
const CacheableModel = require("../modelCache"); // Import CacheableModel

// Extend Giveaway dengan CacheableModel
class Giveaway extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        channelId: { type: DataTypes.STRING, allowNull: false },
        messageId: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
        duration: { type: DataTypes.INTEGER, allowNull: false },
        winners: { type: DataTypes.INTEGER, allowNull: false },
        prize: { type: DataTypes.STRING, allowNull: false },
        participants: { type: DataTypes.JSON, defaultValue: [] },
        ended: { type: DataTypes.BOOLEAN, defaultValue: false },
        roleId: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: "Giveaway",
        tableName: "giveaways",
        timestamps: false,
      }
    );
  }
}

Giveaway.init(sequelize);

module.exports = Giveaway;