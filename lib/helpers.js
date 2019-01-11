/*
 * Helpers for various tasks
 *
 */

// Dependencies
const fs = require("fs");
const crypto = require("crypto");
const config = require("./config");
const https = require("https");
const querystring = require("querystring");
const path = require("path");

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = str => {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = str => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = strLength => {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Start the final string
    let str = "";
    for (let i = 0; i < strLength; i++) {
      // Get random character from the possibleCharacters string
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );

      // Append this character to the final string
      str += randomCharacter;
    }

    // Return the final string
    return str;
  } else {
    return false;
  }
};

// Email validation
helpers.validateEmail = email => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Send mail via Mailgun
helpers.sendMailgunMail = (email, subject, text, callback) => {
  // Validate parameters
  email =
    typeof email == "string" && helpers.validateEmail(email.trim())
      ? email.trim()
      : false;
  subject =
    typeof subject == "string" && subject.trim().length > 0
      ? subject.trim()
      : false;
  text =
    typeof text == "string" && text.trim().length > 0 ? text.trim() : false;

  if (email && subject && text) {
    // Configure the request payload
    const payload = {
      from: config.mailgun.defaultSmtpLogin,
      to: email,
      subject,
      text
    };

    // Stringify the payload
    const stringPayload = querystring.stringify(payload);
    // Configure the request details
    const requestDetails = {
      protocol: "https:",
      hostname: "api.mailgun.net",
      method: "POST",
      path: `/v3/${config.mailgun.apiBaseUrl}/messages`,
      auth: `api:${config.mailgun.apiKey}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, res => {
      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on("error", e => {
      callback(e);
    });

    // Add payload
    req.write(stringPayload);

    // End the request
    req.end();
  } else {
    callback("Given parameters were missing or invalid");
  }
};

// Send payment via Stripe
helpers.sendStripePayment = (email, amount, source, callback) => {
  // Validate parameters
  email =
    typeof email == "string" && helpers.validateEmail(email.trim())
      ? email.trim()
      : false;
  amount =
    typeof amount == "number" && amount % 1 === 0 && amount >= 1
      ? amount
      : false;
  source =
    typeof source == "string" && config.stripe.sources.includes(source)
      ? source
      : false;

  if (email && amount && source) {
    // Configure the request payload
    const payload = {
      amount,
      currency: config.stripe.currency,
      source,
      receipt_email: email
    };

    // Stringify the payload
    const stringPayload = querystring.stringify(payload);
    // Configure the request details
    const requestDetails = {
      protocol: "https:",
      hostname: "api.stripe.com",
      method: "POST",
      path: `/v1/charges`,
      auth: config.stripe.secretKey,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, res => {
      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on("error", e => {
      callback(e);
    });

    // Add payload
    req.write(stringPayload);

    // End the request
    req.end();
  } else {
    callback("Given parameters were missing or invalid");
  }
};

// Get the string content of a template
helpers.getTemplate = (templateName, data, callback) => {
  templateName =
    typeof templateName == "string" && templateName.length > 0
      ? templateName
      : false;
  data = typeof data == "object" && data !== null ? data : {};
  if (templateName) {
    const templateDir = path.join(__dirname, `/../templates/`);
    fs.readFile(`${templateDir}${templateName}.html`, "utf8", (err, str) => {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        const finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback("No template could be found");
      }
    });
  } else {
    callback("A valid template name was not specified");
  }
};

// Add the universal header and footer to a string, and pass provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  str = typeof str == "string" && str.length > 0 ? str : "";
  data = typeof data == "object" && data !== null ? data : {};
  // Get the header
  helpers.getTemplate("_header", data, (err, headerString) => {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate("_footer", data, (err, footerString) => {
        if (!err && footerString) {
          // Add them all together
          const fullString = `${headerString}${str}${footerString}`;
          callback(false, fullString);
        } else {
          callback("Could not find the footer template");
        }
      });
    } else {
      callback("Could not find the header template");
    }
  });
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
  str = typeof str == "string" && str.length > 0 ? str : "";
  data = typeof data == "object" && data !== null ? data : {};

  // Add the templateGlobals of the data object, prepending their key name with "global"
  for (let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data[`global.${keyName}`] = config.templateGlobals[keyName];
    }
  }

  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] == "string") {
      let replace = data[key];
      let find = `\{${key}\}`;
      str = str.replace(new RegExp(find, "g"), replace);
    }
  }
  return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, callback) => {
  fileName =
    typeof fileName == "string" && fileName.length > 0 ? fileName : false;
  if (fileName) {
    const publicDir = path.join(__dirname, "/../public/");
    fs.readFile(`${publicDir}${fileName}`, (err, data) => {
      if (!err && data) {
        callback(false, data);
      } else {
        callback("No file could be found");
      }
    });
  } else {
    callback("A valid file name was not specified");
  }
};

// Export the module
module.exports = helpers;
