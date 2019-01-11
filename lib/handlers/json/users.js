/*
 * Request handlers for /users route
 *
 */

// Dependencies
const _data = require("../../data");
const helpers = require("../../helpers");
const tokens = require("./tokens");

// Users
const users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.includes(data.method)) {
    _users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the user submethods
const _users = {};

// Users - post
// Required data: firstName, lastName, email, password, address, tosAgreement
// Optional data: none
_users.post = (data, callback) => {
  // Check that all required fields are filled out
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const address =
    typeof data.payload.address == "string" &&
    data.payload.address.trim().length > 0
      ? data.payload.address.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" && data.payload.tosAgreement;

  if (firstName && lastName && email && password && address && tosAgreement) {
    // Make sure that the user does not already exist
    _data.read("users", email, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            email,
            hashedPassword,
            address,
            tosAgreement: true
          };
          // Store the user
          _data.create("users", email, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user's password" });
        }
      } else {
        // User slaready exists
        callback(400, {
          Error: "A user with that email already exists"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Users - get
// Required data: email
// Optional data: none
_users.get = (data, callback) => {
  // Check that the email is valid
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
        _data.read("users", email, (err, data) => {
          if (!err && data) {
            // remove the hashed password from the user object before returning it to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
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

// Users - put
// Required data: email
// Optional data: firstName, lastName, password, address (at least one must be specified)
_users.put = (data, callback) => {
  // Check for the required field
  const email =
    typeof data.payload.email == "string" &&
    helpers.validateEmail(data.payload.email.trim())
      ? data.payload.email.trim()
      : false;

  // Check for the optional fields
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const address =
    typeof data.payload.address == "string" &&
    data.payload.address.trim().length > 0
      ? data.payload.address.trim()
      : false;

  // Error if the email is invalid
  if (email) {
    // Error if nothing is sent to update
    if (firstName || lastName || password || address) {
      // Get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      // Verify that the given token is valid for the email
      tokens.verifyToken(token, email, tokenIsValid => {
        if (tokenIsValid) {
          // Lookup user
          _data.read("users", email, (err, userData) => {
            if (!err && userData) {
              // Update the fields neccessary
              if (firstName) userData.firstName = firstName;
              if (lastName) userData.lastName = lastName;
              if (password) userData.hashedPassword = helpers.hash(password);
              if (address) userData.address = address;

              // Store the new updates
              _data.update("users", email, userData, err => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: "Could not update the user" });
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
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Users - delete
// Required data: email
// Optional data: none
_users.delete = (data, callback) => {
  // Check that the email is valid
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
            _data.delete("users", email, err => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(400, { Error: "Could not find the specified user" });
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
module.exports = users;
