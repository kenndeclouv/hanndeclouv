const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Ticket extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },

        channelId: { type: DataTypes.STRING, allowNull: false },
        staffRoleId: { type: DataTypes.STRING, allowNull: false },
        logsChannelId: { type: DataTypes.STRING, allowNull: false },
        transcriptChannelId: { type: DataTypes.STRING, allowNull: false },

        title: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: "TicketConfig",
        tableName: "ticket_configs",
        timestamps: false,
      }
    );
  }
}

Ticket.init(sequelize);

module.exports = Ticket;
