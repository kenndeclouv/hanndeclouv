const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Inventory extends CacheableModel {
  static init(sequelize) {
    return super.init(
      {
        userId: { type: DataTypes.STRING, allowNull: false },
        itemName: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        modelName: "Inventory",
        tableName: "inventories",
        timestamps: false,
      }
    );
  }
}

Inventory.init(sequelize);

module.exports = Inventory;
