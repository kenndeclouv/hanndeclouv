const Pet = require("./Pet");
const UserPet = require("./UserPet");

const models = {
  Pet,
  UserPet,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = models;
