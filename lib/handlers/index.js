/*
 * Request handlers
 *
 */

// Dependencies
const { users, tokens, menus, carts, orders } = require("./json");
const {
  favicon,
  publicAssets,
  indexPage,
  menuPage,
  cartPage,
  cartReset,
  orderPlaced,
  accountCreate,
  accountEdit,
  accountDeleted,
  sessionCreate,
  sessionDeleted
} = require("./html");

// Define the handlers
const handlers = {
  users,
  tokens,
  menus,
  carts,
  orders,
  favicon,
  publicAssets,
  indexPage,
  menuPage,
  cartPage,
  cartReset,
  orderPlaced,
  accountCreate,
  accountEdit,
  accountDeleted,
  sessionCreate,
  sessionDeleted,
  ping(data, callback) {
    callback(200);
  },
  notFound(data, callback) {
    callback(404);
  }
};

// Export the module
module.exports = handlers;
