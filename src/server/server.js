"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

const Dotenv = require("dotenv").config();
if (Dotenv.error) {
  throw Dotenv.error;
}

if (NODE_ENV === "production") {
  require("@babel/polyfill");
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

// I need to review the code in this "onPreResponse" hook and refactor it, if necessary.
server.ext({
  type: "onPreResponse",
  method: function(request, h) {
    let error;
    let message;
    let flash;

    try {
      // console.log("REQUEST.RESPONSE:", request.response);
      // console.log("REQUEST.RESPONSE.SOURCE:", request.response.source);

      // If a user is unauthenticated and they gain access to a route that requires authentication,
      // then there will be no "request.response.source" property. However, there will be a
      // "request.response.isBoom" property. This conditional check will check for
      // "request.response.isBoom" and set the necessary the error and flash values accordingly.
      if (request.response.isBoom) {
        error = request.response.output.payload.error;
        message = request.response.output.payload.message;
        flash = `${error}: ${message}`;
        return { error, flash };
      }

      // All errors should be set to a Boom error object before a response is returned to the client.
      // If there is an error, then the "error" property will be set to the HTTP status message
      // (e.g., "Bad Request", "Internal Server Error") and the "flash" property will be set according
      // to the explanations below.
      if (request.response.source && request.response.source.error && request.response.source.error.isBoom) {
        // HTTP status message
        error = request.response.source.error.output.payload.error;
        // If the user defined a custom error message, then "message" will be that custom error
        // message. Otherwise, "message" will be the same as the HTTP status message.
        message = request.response.source.error.message;

        // If the flash message is null, then set it to an appropriate message.
        if (!request.response.source.flash) {
          // In the catch block, if the Boom error was set like this "error = new Boom(e)", then
          // the HTTP status message and the error message that is derived from `error.message`
          // (e.g., "An internal server error occurred") will be the same. So set the flash message
          // to be `error.message`.
          if (error === message) {
            flash = request.response.source.error.output.payload.message;
          }
          // Otherwise, in the catch block, if a custom error message was used when creating the
          // Boom error, like this: "new Boom('Custom error message')", then display the HTTP status
          // message along with the custom error message.
          else {
            flash = `${error}: ${message}`;
          }
        }
        // Otherwise use the flash message that was set in the endpoint.
        // This scenario would exist when an error is thrown and a flash message is passed to the
        // error object (e.g., "A page with this slug already exists. Please choose a different slug.");
        else {
          flash = request.response.source.flash;
        }

        // console.log(`BOOM FORMATTED ERROR (onPreResponse): \n [ERROR]: ${error} \n [FLASH]: ${flash}`);
        return { error, flash };
      }
      // If there are no errors, then use the success flash message that was set in the endpoint.
      else {
        flash = request.response.source.flash;
      }
      return h.continue;
    }
    catch(e) {
      console.error("onPreResponse Request Lifecycle Hook:", e);
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
      // "plugins/auth" is where the "@hapi/cookie" strategy is configured, so "@hapi/cookie" needs
      // to be registered before "plugins/auth".
      { plugin: require("@hapi/cookie") },
      // If you configure a default auth strategy, then it needs to be registered before any routes
      // are registered: https://hapi.dev/tutorials/auth/?lang=en_US#default
      { plugin: require("./plugins/auth") },
      // { plugin: require("./plugins/users") },
      { plugin: require("./plugins/pages-admin") },
      { plugin: require("./plugins/pages-public") },
      { plugin: require("./plugins/pages-both") },
      { plugin: require("./plugins/helpers") },
      { plugin: require("@hapi/inert") },
      // Route handlers to serve static files (HTML, CSS, JS, images)
      { plugin: require("./plugins/static-routes") },
      // { plugin: require("./plugins/documentation") },
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
