// Dependencies
const helpers = require("../../helpers");

// Account has been deleted
const orderPlaced = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == "get") {
    // Prepare data for intepolation
    const templateData = {
      "head.title": "Order Placed",
      "head.description": "Your order has been placed.",
      "body.class": "orderPlaced"
    };

    // Read in a template as a string
    helpers.getTemplate("orderPlaced", templateData, (err, str) => {
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
module.exports = orderPlaced;
