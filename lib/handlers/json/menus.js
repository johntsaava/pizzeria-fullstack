/*
 * Request handlers for /menus route
 *
 */

// Dependencies
const _data = require("../../data");
const helpers = require("../../helpers");
const tokens = require("./tokens");

// Menu
const menus = (data, callback) => {
  const acceptableMethods = ["get"];
  if (acceptableMethods.includes(data.method)) {
    _menus[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the menu methods
const _menus = {};

// Menus - get
// Required data: email
// Optional data: none
_menus.get = (data, callback) => {
  // Check for the required field
  const email =
    typeof data.queryStringObject.email == "string" &&
    helpers.validateEmail(data.queryStringObject.email.trim())
      ? data.queryStringObject.email.trim()
      : false;

  if (email) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // Verify that the given token is valid for the email
    tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup the menu
        _data.read("menus", "menu", (err, menuData) => {
          if (!err && menuData) {
            callback(200, menuData);
          } else {
            callback(400, { Error: "The specified menu does not exist" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Export the module
module.exports = menus;
