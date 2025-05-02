const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class UserPet extends CacheableModel {
  static init(sequelizeInstance) {
    return super.init(
      {
        userId: { type: DataTypes.STRING, allowNull: false },
        petId: { type: DataTypes.INTEGER, allowNull: false },
        level: { type: DataTypes.INTEGER, defaultValue: 1 },
        petName: { type: DataTypes.STRING, allowNull: false },
        hunger: { type: DataTypes.INTEGER, defaultValue: 100 },
        happiness: { type: DataTypes.INTEGER, defaultValue: 100 },
        lastUse: { type: DataTypes.DATE, defaultValue: null },
        lastGacha: { type: DataTypes.DATE, defaultValue: null },
        isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize: sequelizeInstance,
        modelName: "UserPet",
        tableName: "user_pets",
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pet, { foreignKey: "petId", as: "pet" });
  }
}

UserPet.init(sequelize);

module.exports = UserPet;
