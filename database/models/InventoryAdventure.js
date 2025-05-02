const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class InventoryAdventure extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.STRING, allowNull: false },
        itemName: { type: DataTypes.STRING, allowNull: false },
        quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
      },
      {
        sequelize,
        modelName: "InventoryAdventure",
        tableName: "inventory_adventures",
        timestamps: false,
      }
    );
  }
}

InventoryAdventure.init(sequelize);

module.exports = InventoryAdventure;
