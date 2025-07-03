const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Premium extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        userId: { type: DataTypes.STRING, allowNull: false },
        isPremium: { type: DataTypes.BOOLEAN, defaultValue: 0 }, // JSON string of checklist items
        expiresAt: {
          type: DataTypes.DATE,
          defaultValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
      },
      {
        sequelize,
        modelName: "Premium",
        tableName: "premiums",
        timestamps: false,
      }
    );
  }
}

Premium.init(sequelize);

module.exports = Premium;
