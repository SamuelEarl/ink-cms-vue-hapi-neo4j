"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

// Imports
const uuidv4 = require("uuid/v4");
const Boom = require("@hapi/boom");

exports.plugin = {
  pkg: require("./package.json"),
  dependencies: ["database"],
  register: async function(server, options) {

    // Set session to the Neo4j "session" database object
    const session = server.app.session;

    // // Create a "helpers" plugin that has a server method called "catch", like this:
    // function(e, message, path) {
    //   let err;

    //   if (message) {
    //     err = new Boom(message);
    //   }
    //   else {
    //     err = new Boom(e);
    //   }

    //   // `path` is from `request.path`
    //   const errorLog = `[ENDPOINT]: ${path}\n[ERROR]: ${err}`;

    //   // Log the error:
    //   console.error(errorLog);
    //   // The nice thing about using a helper method is that you could add logging here and it would be added for every catch block in every route.

    //   return err;
    // }

    // // Call the "catch" method:
    // catch(e) {
    //   const msg = "Some error message";
    //   const errorRes = server.methods.catch(e, msg, request.path);
    //   error = errorRes;
    // }

    // // Also, do I need to go back to any of the places where I used "throw new Error()" and replace those with a more descriptive "throw new Boom('msg', { statusCode: 400})"?
    // // Right now everything throws a 500 "Internal Server Error", but that might not be the most accurate error message to send back to the user.
  }
};
