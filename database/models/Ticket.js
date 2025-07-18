const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Ticket extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        channelId: { type: DataTypes.STRING, allowNull: false },

        conversation: { type: DataTypes.JSON, defaultValue: "[]" },
        status: { type: DataTypes.ENUM("open", "closed"), defaultValue: "open" },
      },
      {
        sequelize,
        modelName: "Ticket",
        tableName: "tickets",
        timestamps: true,
      }
    );
  }
}

Ticket.init(sequelize);

module.exports = Ticket;
