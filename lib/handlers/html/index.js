/*
 * Html request handlers
 *
 */

// Dependencies
const favicon = require("./favicon");
const publicAssets = require("./publicAssets");
const indexPage = require("./indexPage");
const menuPage = require("./menuPage");
const cartPage = require("./cartPage");
const cartReset = require("./cartReset");
const orderPlaced = require("./orderPlaced");
const accountCreate = require("./accountCreate");
const accountEdit = require("./accountEdit");
const accountDeleted = require("./accountDeleted");
const sessionCreate = require("./sessionCreate");
const sessionDeleted = require("./sessionDeleted");

// Define the handlers
const handlers = {
  favicon,
  publicAssets,
  indexPage,
  menuPage,
  cartPage,
  cartReset,
  orderPlaced,
  accountCreate,
  accountEdit,
  accountCreate,
  accountDeleted,
  sessionCreate,
  sessionDeleted
};

// Export the module
module.exports = handlers;
