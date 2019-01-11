/*
 * JSON request handlers
 *
 */

// Dependencies
const users = require("./users");
const tokens = require("./tokens");
const menus = require("./menus");
const carts = require("./carts");
const orders = require("./orders");

// Define the handlers
const handlers = {
  users,
  tokens,
  menus,
  carts,
  orders
};

// Export the module
module.exports = handlers;
