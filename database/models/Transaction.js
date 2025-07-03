const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Transaction extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },

        productId: { type: DataTypes.INTEGER, allowNull: false },

        description: { type: DataTypes.STRING, allowNull: false },
        status: {
          type: DataTypes.ENUM("pending", "success", "failed"),
          defaultValue: "pending",
        },
        quantity: { type: DataTypes.BIGINT, defaultValue: 1 },
        total: { type: DataTypes.BIGINT, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: "Transaction",
        tableName: "transactions",
        timestamps: true,
      }
    );
  }
}

Transaction.init(sequelize);

module.exports = Transaction;
