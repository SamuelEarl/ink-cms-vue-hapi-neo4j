"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

// Imports
const uuidv4 = require("uuid/v4");
const Boom = require("@hapi/boom");

exports.plugin = {
  pkg: require("./package.json"),
  register: async function(server, options) {

    /**
     * Beginning of "catch" server method
     * Use the "catch" server method in your catch blocks, like this:
     *
     * catch(e) {
     *   const msg = e.message ? e.message : "Default error message for the route";
     *   const errorRes = server.methods.catch(e, msg, request.path);
     *   error = errorRes;
     * }
     *
     */
    const catchMethod = function(e, msg, path) {
      try {
        let err;

        // Set the error object to a Boom error object.
        if (msg) {
          err = new Boom(msg);
        }
        else {
          err = new Boom(e);
        }

        // Set the error log message. The `path` variable is the same as `request.path`.
        const errorLog = `[ENDPOINT]: ${path}\n[ERROR]: ${err}`;

        // Log the error message.
        console.error(errorLog);
        // The nice thing about using a helper method to handle the logic in your catch blocks is
        // that you could add logging here and it would be added for every catch block in every
        // route without unnecessarily repeating yourself.

        return err;
      }
      catch(e) {
        const err = new Boom(e);
        const errorLog = `[ENDPOINT]: ${path}\n[ERROR]: ${err}`;
        console.log(errorLog);
      }
    };

    server.method({
      name: "catch",
      method: catchMethod,
      options: {}
    });
    /**
     * End of "catch" server method
     */

  }
};
