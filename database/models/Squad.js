const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Squad extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },

        name: { type: DataTypes.STRING, allowNull: false },
        emoji: { type: DataTypes.STRING, allowNull: false },
        color: { type: DataTypes.STRING, allowNull: false },
        ownerId: { type: DataTypes.STRING, allowNull: false },
        roleId: { type: DataTypes.STRING, allowNull: false },
        rules: { type: DataTypes.STRING, allowNull: true },
        isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
        channelId: { type: DataTypes.STRING, allowNull: true },
        voiceId: { type: DataTypes.STRING, allowNull: true },
        threadId: { type: DataTypes.STRING, allowNull: true },
        memberId: { type: DataTypes.JSON, allowNull: true, defaultValue: "[]" },
      },
      {
        sequelize,
        modelName: "Squad",
        tableName: "squads",
        timestamps: false,
      }
    );
  }
}

Squad.init(sequelize);

module.exports = Squad;
