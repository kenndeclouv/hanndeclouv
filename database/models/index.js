const Pet = require("./Pet");
const Product = require("./Product");
const ProductCategory = require("./ProductCategory");
const UserPet = require("./UserPet");

const models = {
  Pet,
  UserPet,
  Product,
  ProductCategory
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = models;