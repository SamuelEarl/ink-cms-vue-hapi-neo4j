"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV === "production") {
  require("@babel/polyfill");
}
require("make-promises-safe");
const Fs = require("fs");
const Path = require("path");
// const Shell = require("shelljs");
const Hapi = require("@hapi/hapi");
const Boom = require("@hapi/boom");
const Credentials = require("./credentials");

// Server configs
const server = new Hapi.Server({
  // Specifying a host is optional and your app will work just fine without this config, but you should
  // not specify a host or else you will have problems trying to access your production app in Docker.
  // host: process.env.HOST || "localhost",
  port: process.env.PORT || 4000
});

server.ext({
  type: "onPreResponse",
  method: function(request, h) {
    // console.log("REQUEST.RESPONSE.SOURCE:", request.response.source);

    // All errors should be set to a Boom error object before a response is returned to the client.
    // If there is an error, then the "error" property will be set to the HTTP status message
    // (e.g., "Bad Request", "Internal Server Error") and the "flash" property will be set to the
    // error message that is derived from `error.message` (e.g., "An internal server error occurred").
    if (request.response.source.error && request.response.source.error.isBoom) {
      const error = request.response.source.error.output.payload.error;
      const flash = request.response.source.error.output.payload.message;

      // console.log(`BOOM FORMATTED ERROR (onPreResponse): \n [ERROR]: ${error} \n [FLASH]: ${flash}`);
      return { error, flash };
    }

    return h.continue;
  }
});

// // Configure the user's session cookie:
// server.state("sessionId", {
//   isSameSite: NODE_ENV === "production" ? "Strict" : false, // false for all environments except for production
//   isSecure: NODE_ENV === "production", // false for all environments except for production
//   clearInvalid: true,
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
}
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
  const dbOptsProd = Credentials.dbOptsProd;
  dbOptions = {
    uri: dbOptsProd.uri,
    user: dbOptsProd.user,
    password: dbOptsProd.password
  };
}
else {
  const dbOptsDev = Credentials.dbOptsDev;
  dbOptions = {
    uri: dbOptsDev.uri,
    user: dbOptsDev.user,
    password: dbOptsDev.password
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
      // { plugin: require("bell") },
      // { plugin: require("hapi-auth-cookie") },
      // { plugin: require("./plugins/auth") },
      // { plugin: require("./plugins/users") },
      { plugin: require("./plugins/public-pages") },
      { plugin: require("./plugins/admin-pages") },
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
  // Throw any errors
  catch(err) {
    const serverError = `\nSERVER ERROR:\n[ERROR MESSAGE]: ${err.message}\n[ERROR CODE]: ${err.code}\n[STACK TRACE]: ${err.stack}`;

    console.log(serverError);
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
