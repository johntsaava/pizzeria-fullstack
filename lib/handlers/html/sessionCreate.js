// Dependencies
const helpers = require("../../helpers");

// Create New Session
const sessionCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == "get") {
    // Prepare data for intepolation
    const templateData = {
      "head.title": "Login to your Account",
      "head.description":
        "Please enter your phone number and password to acess your account.",
      "body.class": "sessionCreate"
    };

    // Read in a template as a string
    helpers.getTemplate("sessionCreate", templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // Return that page as HTML
            callback(200, str, "html");
          } else {
            callback(500, undefined, "html");
          }
        });
      } else {
        callback(500, undefined, "html");
      }
    });
  } else {
    callback(405, undefined, "html");
  }
};

// Export the module
module.exports = sessionCreate;
