/*
 * Request handlers for /orders route
 *
 */

// Dependencies
const _data = require("../../data");
const helpers = require("../../helpers");
const tokens = require("./tokens");
const config = require("../../config");

// Orders
const orders = (data, callback) => {
  const acceptableMethods = ["post", "get"];
  if (acceptableMethods.includes(data.method)) {
    _orders[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the user submethods
const _orders = {};

// Orders - post
// Required data: email, source
// Optional data: none
_orders.post = (data, callback) => {
  // Check that all required fields are filled out
  const email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;
  const source =
    typeof data.payload.source == "string" &&
    config.stripe.sources.includes(data.payload.source)
      ? data.payload.source
      : false;

  if (email && source) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // Verify that the given token is valid for the email
    tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("users", email, (err, userData) => {
          if (
            !err &&
            userData &&
            userData.cart &&
            Object.keys(userData.cart).length > 0
          ) {
            const userOrders =
              typeof userData.orders == "object" &&
              userData.orders instanceof Array
                ? userData.orders
                : [];
            // Lookup the menu
            _data.read("menus", "menu", (err, menuData) => {
              if (!err && menuData) {
                const orderId = helpers.createRandomString(20);
                const orderInfo = {
                  orderId,
                  email,
                  source,
                  cart: userData.cart,
                  amount: 0,
                  cartItemsDescriptions: []
                };
                for (let itemId in userData.cart) {
                  orderInfo.amount +=
                    menuData[itemId].price * userData.cart[itemId];
                  orderInfo.cartItemsDescriptions.push(
                    `${userData.cart[itemId]} ${
                      menuData[itemId].name
                    } $${menuData[itemId].price / 100}`
                  );
                }
                orderInfo.amount =
                  typeof orderInfo.amount == "number" &&
                  orderInfo.amount % 1 === 0 &&
                  orderInfo.amount >= 10
                    ? orderInfo.amount
                    : false;
                if (orderInfo.amount) {
                  // Save the order
                  _data.create("orders", orderId, orderInfo, err => {
                    if (!err) {
                      // Save the new user data
                      userData.orders = userOrders;
                      userData.orders.push(orderId);

                      // Delete current cart
                      delete userData.cart;

                      _data.update("users", email, userData, err => {
                        if (!err) {
                          // Send payment via Stripe
                          helpers.sendStripePayment(
                            email,
                            orderInfo.amount,
                            source,
                            err => {
                              if (!err) {
                                // Send mail via Mailgun
                                helpers.sendMailgunMail(
                                  email,
                                  "Pizzeria - Your order has been processed successfully",
                                  `Dear ${
                                    userData.firstName
                                  },\nThank you for visiting us and making purchase!\nOrder details: ${orderInfo.cartItemsDescriptions.join(
                                    ", "
                                  )}.\nAmount: $${orderInfo.amount / 100}`,
                                  err => {
                                    if (!err) {
                                      callback(200);
                                    } else {
                                      callback(400, {
                                        Error: "Could send email"
                                      });
                                    }
                                  }
                                );
                              } else {
                                callback(400, {
                                  Error: "Could not proceed payment"
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            Error:
                              "Could not update the user with the new check"
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        Error: "Could not create the new order"
                      });
                    }
                  });
                } else {
                  callback(400, {
                    Error: "Could not calculate amount"
                  });
                }
              } else {
                callback(400, { Error: "Could not find the specified menu" });
              }
            });
          } else {
            callback(400, {
              Error: "Could not find the specified user or user's cart is empty"
            });
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

// Orders - get
// Required data: id
// Optional data: none
_orders.get = (data, callback) => {
  // Check that the id is valid
  const id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;

  if (id) {
    // Lookup the order
    _data.read("orders", id, (err, orderData) => {
      if (!err && orderData) {
        // Get the token from the headers
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;

        // Verify that the given token is valid and belongs to the user who created the check
        tokens.verifyToken(token, orderData.email, tokenIsValid => {
          if (tokenIsValid) {
            // Return the check data
            callback(200, orderData);
          } else {
            callback(403);
          }
        });
      } else {
        callback(404, { Error: "Missing required field" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Export the module
module.exports = orders;
