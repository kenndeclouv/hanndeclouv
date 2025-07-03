const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const CacheableModel = require("../modelCache");

class ProductCategory extends CacheableModel {
  static init(sequelize) {
    super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: "ProductCategory",
        tableName: "product_categories",
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Product, {
      foreignKey: "productCategoryId",
      as: "products",
    });
  }
}

ProductCategory.init(sequelize);

module.exports = ProductCategory;
