const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Invite extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        invites: { type: DataTypes.INTEGER, defaultValue: 0 },
      },
      {
        sequelize,
        modelName: "Invite",
        tableName: "invites",
        timestamps: false,
      }
    );
  }
}

Invite.init(sequelize);

module.exports = Invite;
