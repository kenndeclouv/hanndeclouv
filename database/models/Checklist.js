const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Checklist extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false, unique: true },
        items: { type: DataTypes.JSON, allowNull: false, defaultValue: "[]" }, // JSON string of checklist items
      },
      {
        sequelize,
        modelName: "Checklist",
        tableName: "checklists",
        timestamps: false,
      }
    );
  }
}

Checklist.init(sequelize);

module.exports = Checklist;
