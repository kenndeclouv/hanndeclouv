const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Password extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        channelId: { type: DataTypes.STRING, allowNull: false, unique: true },
        roleId: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        modelName: "Password",
        tableName: "passwords",
        timestamps: false,
      }
    );
  }
}

Password.init(sequelize);

module.exports = Password;
