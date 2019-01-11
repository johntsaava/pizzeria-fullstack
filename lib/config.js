/*
 * Create and export configuration variables
 *
 */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsASecret",
  mailgun: {
    defaultSmtpLogin: "",
    apiBaseUrl: "",
    apiKey: ""
  },
  stripe: {
    secretKey: "",
    currency: "usd",
    sources: ["tok_visa", "tok_mastercard", "tok_unionpay"]
  },
  templateGlobals: {
    appName: "Pizzeria",
    companyName: "NotARealCompany, Inc",
    yearCreated: "2018",
    baseUrl: "http://localhost:3000/"
  }
};

// Determine which environment was passed as command-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

// Check that the current environment is one of the environments above, if not,  default to staging
const environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;

// Export the module
module.exports = environmentToExport;
