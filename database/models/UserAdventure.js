const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class UserAdventure extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        userId: { type: DataTypes.STRING, allowNull: false, unique: true },
        level: { type: DataTypes.INTEGER, defaultValue: 1 },
        xp: { type: DataTypes.INTEGER, defaultValue: 0 },
        hp: { type: DataTypes.INTEGER, defaultValue: 100 },
        gold: { type: DataTypes.INTEGER, defaultValue: 50 },
        strength: { type: DataTypes.INTEGER, defaultValue: 10 },
        defense: { type: DataTypes.INTEGER, defaultValue: 5 },
        monsterName: { type: DataTypes.STRING, defaultValue: null },
        monsterHp: { type: DataTypes.INTEGER, defaultValue: 0 },
        monsterStrength: { type: DataTypes.INTEGER, defaultValue: 0 },
        monsterGoldDrop: { type: DataTypes.INTEGER, defaultValue: 0 },
        monsterXpDrop: { type: DataTypes.INTEGER, defaultValue: 0 },
      },
      {
        sequelize,
        modelName: "UserAdventure",
        tableName: "user_adventures",
        timestamps: false,
      }
    );
  }
}

UserAdventure.init(sequelize);

module.exports = UserAdventure;
