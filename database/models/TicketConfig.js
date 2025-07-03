const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Ticket extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },

        channelId: { type: DataTypes.STRING, allowNull: false },
        messageId: { type: DataTypes.STRING, allowNull: true },
        staffRoleId: { type: DataTypes.STRING, allowNull: false },
        logsChannelId: { type: DataTypes.STRING, allowNull: false },
        transcriptChannelId: { type: DataTypes.STRING, allowNull: false },

        name: { type: DataTypes.STRING, allowNull: false },
        format: { type: DataTypes.STRING, allowNull: false },

        title: { type: DataTypes.STRING, allowNull: true },
        button: { type: DataTypes.JSON, allowNull: true },
        buttonColor: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.STRING, allowNull: true },
        image: { type: DataTypes.STRING, allowNull: true },
        thumbnail: { type: DataTypes.STRING, allowNull: true },
        footerText: { type: DataTypes.STRING, allowNull: true },
        footerIcon: { type: DataTypes.STRING, allowNull: true },

        ticketCategoryId: { type: DataTypes.STRING, allowNull: true },

        ticketDescription: { type: DataTypes.STRING, allowNull: true },
        ticketImage: { type: DataTypes.STRING, allowNull: true },
        ticketThumbnail: { type: DataTypes.STRING, allowNull: true },
        ticketFooterText: { type: DataTypes.STRING, allowNull: true },
        ticketFooterIcon: { type: DataTypes.STRING, allowNull: true },
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
