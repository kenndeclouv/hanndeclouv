const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class TicketCounter extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
      },
      {
        sequelize,
        modelName: "TicketCounter",
        tableName: "ticket_counters",
        timestamps: false,
      }
    );
  }
}

TicketCounter.init(sequelize);

module.exports = TicketCounter;
