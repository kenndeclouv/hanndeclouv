const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Embed extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        channelId: { type: DataTypes.STRING, allowNull: false },
        messageId: { type: DataTypes.STRING, allowNull: true },

        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        buttons: { type: DataTypes.JSON, defaultValue: "[]" },
        fields: { type: DataTypes.JSON, defaultValue: "[]" },
      },
      {
        sequelize,
        modelName: "Embed",
        tableName: "embeds",
        timestamps: false,
      }
    );
  }
}

Embed.init(sequelize);

module.exports = Embed;
