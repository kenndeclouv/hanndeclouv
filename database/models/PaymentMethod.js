const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class PaymentMethod extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },

        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        emoji: { type: DataTypes.STRING, allowNull: true },
        image: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: "PaymentMethod",
        tableName: "payment_methods",
        timestamps: false,
      }
    );
  }
}

PaymentMethod.init(sequelize);

module.exports = PaymentMethod;
