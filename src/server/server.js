"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

const Dotenv = require("dotenv").config();
if (Dotenv.error) {
  throw Dotenv.error;
}

if (NODE_ENV === "production") {
  require("core-js/stable");
  require("regenerator-runtime/runtime");
}
require("make-promises-safe");
const Fs = require("fs");
const Path = require("path");
// const Shell = require("shelljs");
const Hapi = require("@hapi/hapi");
const Boom = require("@hapi/boom");

// Server configs
const server = new Hapi.Server({
  // Specifying a host is optional and your app will work just fine without this config, but you should
  // not specify a host or else you will have problems trying to access your production app in Docker.
  // host: process.env.HOST || "localhost",
  port: process.env.PORT || 4000
});


/**
 * Comments for the onPreResponse method:
 *
 * The return values from your endpoints will be passed to the "onPreResponse" method. This gives
 * you an opportunity to format any data before they are returned to the browser. I usually only
 * format the flash message and leave everything else alone.
 *
 * If you return a single value in your endpoint, then that value can be found on the
 * "request.response" object inside the "onPreResponse" method. If you return an object of values
 * (e.g., return { error, flash, user }), then those values are found on the
 * "request.response.source" object inside the "onPreResponse" method.
 *
 * To format the flash message before it is returned to the browser, you will simply do something
 * like this:
 * request.reponse.source.flash = "Custom flash message";
 */
server.ext({
  type: "onPreResponse",
  method: function(request, h, error) {
    const res = request.response;
    let httpStatusMsg;
    let errorMsg;

    try {
      // console.log("REQUEST.RESPONSE:", res);
      // console.log("REQUEST.RESPONSE.SOURCE:", res.source);


      /**
       * If a validation error occurs, then there will be a "res.isJoi" property instead of a
       * "res.source.error.isBoom" property.
       * For more details about Joi errors, see https://hapi.dev/family/joi/?v=15.1.1#errors.
       * NOTE: This check for "res.isJoi" has to come before the next check for "res.isBoom" because
       * validation errors also have an "isBoom" property. If the "isBoom" check came first, then it
       * would also catch the validation errors that have the "isJoi" property and it would handle
       * those incorrectly.
       */
      if (res.isJoi) {
        // Set the error property to equal "res.isJoi". The value of "res.isJoi" is true, so the
        // error property will also be true.
        const error = res.isJoi;
        let flash = "";
        for (let i=0; i < res.details.length; i++) {
          let validationErrorMsg = res.details[i].message;

          // See what each validation error message looks like.
          // console.log(`VALIDATION ERROR ${i}:`, validationErrorMsg);

          // Combine all of the error messages into a single, cleanly formatted string.
          flash = `${flash} ${validationErrorMsg}.`;
        }
        // See the final output of the flash message:
        // console.log("FLASH:", flash);

        // Skip the rest of the "onPreResponse" method and return the "error" and "flash"
        // properties to the browser.
        return { error, flash };
      }

      /**
       * If an error occurs before the route handler executes (e.g., a user is not logged in and
       * they gain access to a route that requires authentication or if the user does not have the
       * proper permissions to perform a given task), then there will be a "res.isBoom" property
       * instead of a "res.source.error.isBoom" property.
       */
      // Check if the "res.isBoom" property exists and set the "error" and "flash" properties.
      if (res.isBoom) {
        const statusCode = res.output.payload.statusCode;
        httpStatusMsg = res.output.payload.error;
        errorMsg = res.output.payload.message;
        // Set the error property to equal "res.isBoom". The value of "res.isBoom" is true, so the
        // error property will also be true.
        const error = res.isBoom;
        const flash = `Error: ${statusCode} ${httpStatusMsg}: ${errorMsg}`;
        // Skip the rest of the "onPreResponse" method and return the "error" and "flash"
        // properties to the browser.
        return { error, flash };
      }

      /**
       * If an error occurs in the route handler (e.g., an error was thrown because
       * "A page with this slug already exists" or there was a database error), then there will be a
       * "res.source.error.isBoom" property instead of a "res.isBoom" property.
       * The following conditions will format the flash message depending on the scenario.
       */
      // Check if the "res.source.error.isBoom" property exists.
      if (res.source && res.source.error && res.source.error.isBoom) {
        // httpStatusMsg = HTTP status message (e.g., "Bad Request", "Internal Server Error")
        httpStatusMsg = res.source.error.output.payload.error;
        // If a custom error message was defined in the route, then "errorMsg" will be that custom
        // error message. Otherwise, "errorMsg" will be the same as the HTTP status message above.
        errorMsg = res.source.error.message;

        /**
         * If an error is thrown in a route before the "flash" property can be set in that route,
         * then the "flash" property will be null.
         */
        // Check if the "res.source.flash" property exists. If it doesn't (i.e., if the flash
        // property is null), then set "res.source.flash" to be a helpful error message.
        if (!res.source.flash) {
          // If errors are either thrown or created with no custom error messages
          // (e.g., throw new Error(), new Boom(e)), then the "httpStatusMsg" and "errorMsg"
          // variables (above) should be the same (e.g., "An internal server error occurred").
          // In those cases, set "res.source.flash" to be the error message from the
          // "res.source.error.output.payload.message" property.
          if (httpStatusMsg === errorMsg) {
            res.source.flash = res.source.error.output.payload.message;
          }
          // If errors are either thrown or created with custom error messages
          // (e.g., throw new Error("Custom error message"), new Boom("Custom error message"), then
          // set "res.source.flash" to be a combination of the HTTP status message
          // (e.g. "Bad Request") and the custom error message.
          else {
            res.source.flash = `${httpStatusMsg}: ${errorMsg}`;
          }
        }

        /**
         * NOTE:
         * If an error occurs in the route handler and if the "flash" property was also set in the
         * route handler (either in the try block or in the catch block), then the "res.source.flash"
         * property will exist inside this "onPreResponse" method. In that case the flash message
         * will be passed back to the browser as it is and you don't need to worry about formatting it.
         *
         * One example of when that scenario would exist is when an error is thrown in the try block
         * and a flash message is passed to the error object, like this:
         *
         * flash = "A page with this slug already exists. Please choose a different slug.";
         * throw new Error(flash);
         */
      }

      return h.continue;
    }
    catch(e) {
      console.error("Error in onPreResponse Request Lifecycle Extension Point:", e);
    }
  }
});

// // Configure the user's session cookie.
// // For more details see https://hapi.dev/api/?v=18.3.1#server.state()
// server.state("sessionId", {
//   // You might get errors if these options are not set to "false" during development:
//   isSameSite: NODE_ENV === "production" ? "Strict" : false, // false for all environments except for production
//   isSecure: NODE_ENV === "production", // false for all environments except for production
// });




// Directory that contains the log files
const logsDir = Path.resolve(__dirname + "../../../logs");
// Create the /logs directory if it does not exist
if (!Fs.existsSync(logsDir)) {
  Fs.mkdirSync(logsDir);
}
const logsDestination = function() {
  if (NODE_ENV !== "production") {
    // return process.stdout; // Use this line instead if you want to see the output in the terminal
    return Fs.createWriteStream(logsDir + "/server.log");
  }
  else {
    return Fs.createWriteStream(logsDir + "/server.log");
  }
};
const logLevel = function() {
  if (NODE_ENV !== "production") {
    return "debug";
  }
  else {
    return "info";
  }
};

// // Directory that contains the uploaded course card images
// const courseImagesDir = Path.resolve(__dirname + "../../client/assets/uploads");
// // Create the "images/uploads" directory if it does not exist
// if (!Fs.existsSync(courseImagesDir)) {
//   Shell.mkdir("-p", courseImagesDir);
// }

// Database Config Options
let dbOptions;
if (NODE_ENV === "production") {
  dbOptions = {
    uri: process.env.GRAPHENE_PROD_URI,
    user: process.env.GRAPHENE_PROD_USER,
    password: process.env.GRAPHENE_PROD_PASSWORD
  };
}
else {
  dbOptions = {
    uri: process.env.DOCKER_NEO4J_URI,
    user: process.env.DOCKER_NEO4J_USER,
    password: process.env.DOCKER_NEO4J_PASSWORD
    // uri: process.env.GRAPHENE_DEV_URI,
    // user: process.env.GRAPHENE_DEV_USER,
    // password: process.env.GRAPHENE_DEV_PASSWORD
  };
}

const init = async () => {
  try {
    // Register plugins:
    await server.register([
      {
        plugin: require("hapi-pino"),
        options: {
          stream: logsDestination(),
          prettyPrint: NODE_ENV !== "production",
          level: logLevel()
        }
      },
      {
        plugin: require("poop"),
        options: {
          heapdumpFolder: Path.join(__dirname, "../../logs"),
          logPath: Path.join(__dirname, "../../logs/uncaught-exception.log")
        }
      },
      {
        plugin: require("./plugins/database"),
        options: dbOptions
      },
      // "plugins/strategies" is where the "@hapi/cookie" strategy is configured, so "@hapi/cookie"
      // needs to be registered before "plugins/strategies".
      // If you configure a default auth strategy, then it needs to be registered before any routes
      // are registered: https://hapi.dev/tutorials/auth/?lang=en_US#default
      { plugin: require("@hapi/cookie") },
      { plugin: require("./plugins/strategies") },
      { plugin: require("./plugins/accounts") },
      { plugin: require("./plugins/pages-admin") },
      { plugin: require("./plugins/pages-public") },
      { plugin: require("./plugins/pages-both") },
      { plugin: require("./plugins/helpers") },
      { plugin: require("@hapi/inert") },
      // Route handlers to serve static files (HTML, CSS, JS, images)
      { plugin: require("./plugins/static-routes") },
    ]);

    // Start the server and log the following message
    await server.start();
    const serverStart = `hapi server is running at ${server.info.uri}`;
    console.log(serverStart);
    server.logger().info(serverStart);
  }
  // Catch any errors and log them.
  catch(e) {
    const serverError = `\nSERVER ERROR:\n[ERROR MESSAGE]: ${e.message}\n[ERROR CODE]: ${e.code}\n[STACK TRACE]: ${e.stack}`;

    console.error(serverError);
    server.logger().error(serverError);
  }
};

// Display warning messages
process.on("warning", (warning) => {
  server.logger().warn("WARNING NAME: ", warning.name);
  server.logger().warn("WARNING MESSAGE: ", warning.message);
  server.logger().warn("WARNING STACK TRACE: ", warning.stack);
  console.warn("WARNING NAME: ", warning.name);         // Print the warning name
  console.warn("WARNING MESSAGE: ", warning.message);   // Print the warning message
  console.warn("WARNING STACK TRACE: ", warning.stack); // Print the stack trace
});

// The "unhandledRejection" event is emitted whenever a Promise is rejected and no error handler
// is attached to the promise within a turn of the event loop. Read more at
// https://nodejs.org/api/process.html#process_event_unhandledrejection.
/**
 * @param {object} reason - The object with which the promise was rejected (typically an
 * Error object).
 * @param {Promise} promise - The rejected promise.
 */
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "Reason:", reason);
  // Application specific logging, throwing an error, or other logic here...
  process.exit(1);
});

// The "poop" package already handles uncaughtException events and heap dumps, so using a
// process.on("uncaughtException") handler is not necessary. However, I have left this here for
// now as a reference.
// The "uncaughtException" event is emitted when an uncaught JavaScript exception bubbles all the
// way back to the event loop. You can read about how to use "uncaughtException" correctly at
// https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly.
// process.on("uncaughtException", (err) => {
//   console.log(err);
//   process.exit(1);
// });

init();
