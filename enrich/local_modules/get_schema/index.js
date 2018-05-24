"use strict";

const SCHEMA_HOST_NAME = process.env["SCHEMA_HOST_NAME"] || "localhost";
const DEBUG = process.env["DEBUG"] || false;

const http = require("http");

module.exports = (schema, version, callback) => {
  // function(schema) { console.log(schema); }
  const schemaPath =
    "http://" +
    SCHEMA_HOST_NAME +
    ":8080/schemas/com.nordstrom/" +
    schema +
    "/jsonschema/" +
    version;
    // console.log(schemaPath);
  return new Promise((resolve, reject) => {
    http
      .request(schemaPath)
      .on("response", function(response) {
        var data = "";
        response.on("data", function(chunk) {
          data += chunk;
          if (DEBUG) console.log(data);
          // callback(data);
        });
        response.on("end", function() {
          // console.log('data:', JSON.parse(data));
          resolve(JSON.parse(data)); // function(schema) { console.log(JSON.parse(data)); }
          // callback(data);
        });
        response.on("error", function(err) {
          console.log("error");
          reject(err);
        });
      })
      .end();
  });
};
