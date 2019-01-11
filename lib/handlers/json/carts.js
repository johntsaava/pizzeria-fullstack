/*
 * Request handlers for /carts route
 *
 */

// Dependencies
const _data = require("../../data");
const helpers = require("../../helpers");
const tokens = require("./tokens");

// Carts
const carts = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.includes(data.method)) {
    _carts[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the user submethods
const _carts = {};

// Carts - post
// Required data: email, menuItems
// Optional data: none
_carts.post = (data, callback) => {
  const email =
    typeof data.queryStringObject.email == "string" &&
    helpers.validateEmail(data.queryStringObject.email.trim())
      ? data.queryStringObject.email.trim()
      : false;
  const menuItems =
    typeof data.payload.menuItems == "object" && data.payload.menuItems !== null
      ? data.payload.menuItems
      : false;

  if (email && menuItems) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // Verify that the given token is valid for the email
    tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("users", email, (err, userData) => {
          if (!err && userData) {
            // Update the user
            userData.cart = menuItems;
            _data.update("users", email, userData, err => {
              if (!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500, {
                  Error: "Could not update the user"
                });
              }
            });
          } else {
            callback(400, { Error: "The specified user does not exist" });
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

// Carts - get
// Required data: email
// Optional data: none
_carts.get = (data, callback) => {
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
        // Lookup the user
        _data.read("users", email, (err, userData) => {
          if (!err && userData) {
            callback(200, userData.cart);
          } else {
            callback(400, { Error: "The specified user does not exist" });
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

// Carts - put
// Required data: email, menuItems
// Optional data: none
_carts.put = (data, callback) => {
  const email =
    typeof data.queryStringObject.email == "string" &&
    helpers.validateEmail(data.queryStringObject.email.trim())
      ? data.queryStringObject.email.trim()
      : false;
  const menuItems =
    typeof data.payload.menuItems == "object" && data.payload.menuItems !== null
      ? data.payload.menuItems
      : false;

  if (email && menuItems) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // Verify that the given token is valid for the email
    tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("users", email, (err, userData) => {
          if (!err && userData) {
            userData.cart =
              typeof userData.cart == "object" && userData.cart !== null
                ? userData.cart
                : {};
            for (let menuItemId in menuItems) {
              if (userData.cart.hasOwnProperty(menuItemId)) {
                userData.cart[menuItemId] += menuItems[menuItemId];
              } else {
                userData.cart[menuItemId] = menuItems[menuItemId];
              }
            }
            // Update the user
            _data.update("users", email, userData, err => {
              if (!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500, {
                  Error: "Could not update the user"
                });
              }
            });
          } else {
            callback(400, { Error: "The specified user does not exist" });
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

// Carts - delete
// Required data: email
// Optional data: none
_carts.delete = (data, callback) => {
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
        // Lookup the user
        _data.read("users", email, (err, userData) => {
          if (!err && userData) {
            // Update the user
            delete userData.cart;
            _data.update("users", email, userData, err => {
              if (!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500, {
                  Error: "Could not update the user"
                });
              }
            });
            callback(200);
          } else {
            callback(400, { Error: "The specified user does not exist" });
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
module.exports = carts;
