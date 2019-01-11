// Dependencies
const helpers = require("../../helpers");

// Public assets
const publicAssets = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == "get") {
    // Get the file name being requested
    const trimmedAssetName = data.trimmedPath.replace("public/", "").trim();
    if (trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if (!err && data) {
          // Determine the content type (default to plain text)
          let contentType = "plain";

          if (trimmedAssetName.indexOf("css") > -1) {
            contentType = "css";
          }
          if (trimmedAssetName.indexOf("png") > -1) {
            contentType = "png";
          }
          if (trimmedAssetName.indexOf("jpg") > -1) {
            contentType = "jpg";
          }
          if (trimmedAssetName.indexOf(".ico") > -1) {
            contentType = "favicon";
          }
          if (trimmedAssetName.indexOf(".svg") > -1) {
            contentType = "svg";
          }
          // Callback the data
          callback(200, data, contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
};

// Export the module
module.exports = publicAssets;
