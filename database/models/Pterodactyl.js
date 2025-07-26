const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Pterodactyl extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: true }, // salah satu, bisa per guild, bisa per orang
        userId: { type: DataTypes.STRING, allowNull: true },
        apiKey: { type: DataTypes.STRING, allowNull: true },
        link: { type: DataTypes.STRING, allowNull: true },

        messageIds: { type: DataTypes.JSON, defaultValue: [] },
      },
      {
        sequelize,
        modelName: "Pterodactyl",
        tableName: "pterodactyls",
        timestamps: true,
      }
    );
  }
}

Pterodactyl.init(sequelize);

module.exports = Pterodactyl;
