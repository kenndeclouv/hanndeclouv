const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class Product extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },

        productCategoryId: { type: DataTypes.INTEGER, allowNull: true },

        name: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.BIGINT, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        stock: { type: DataTypes.BIGINT, allowNull: true },
      },
      {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.ProductCategory, {
      foreignKey: "productCategoryId",
      as: "category", // optional alias
    });
  }
}

Product.init(sequelize);

module.exports = Product;
