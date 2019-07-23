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

(async () => {
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

    // Display warning messages
    process.on("warning", (warning) => {
      server.logger().warn("WARNING NAME: ", warning.name);
      server.logger().warn("WARNING MESSAGE: ", warning.message);
      server.logger().warn("WARNING STACK TRACE: ", warning.stack);
      console.warn("WARNING NAME: ", warning.name);         // Print the warning name
      console.warn("WARNING MESSAGE: ", warning.message);   // Print the warning message
      console.warn("WARNING STACK TRACE: ", warning.stack); // Print the stack trace
    });
  }
  // Throw any errors
  catch(err) {
    const serverError = `\nSERVER ERROR:\n[ERROR MESSAGE]: ${err.message}\n[ERROR CODE]: ${err.code}\n[STACK TRACE]: ${err.stack}`;

    console.log(serverError);
    server.logger().error(serverError);
  }
})();
