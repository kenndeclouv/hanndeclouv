const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Pet extends CacheableModel {
  static init(sequelizeInstance) {
    return super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        icon: { type: DataTypes.STRING, allowNull: false },
        rarity: {
          type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
          defaultValue: "common",
        },
        bonusType: { type: DataTypes.ENUM("xp", "money"), defaultValue: "xp" },
        bonusValue: { type: DataTypes.INTEGER, defaultValue: 10 },
      },
      {
        sequelize: sequelizeInstance,
        modelName: "Pet",
        tableName: "pets",
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.UserPet, { foreignKey: "petId", as: "userPets" });
  }
}

// Properly initialize the model with the imported sequelize instance
Pet.init(sequelize);

module.exports = Pet;
