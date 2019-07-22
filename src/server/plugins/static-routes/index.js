// Do the paths to the CSS, JavaScript, and image files need to reference the locations of those
// files in production mode only? Everything seems to work as is in development mode.
// I should use the NODE_ENV variable to set the file paths for the index.html file in both
// development and production mode, but I still need to see about setting the file paths for the
// CSS, JS, and image file paths in production mode.

"use strict";

const env = process.env.NODE_ENV || "development";
const Path = require("path");

exports.plugin = {
  pkg: require("./package.json"),
  register: async function(server, options) {

    server.route({
      method: "GET",
      // method: "*", // Does the method need to be "*" so that the index.html file is returned
      // with every request no matter what the method is?
      path: "/{path*}",
      handler: async function(request, h) {
        try {
          if (env === "production") {
            return await h.file(
              Path.join(__dirname, "../../../client/index.html")
            );
          }
          else {
            return await h.file(
              Path.join(__dirname, "../../../../public/index.html")
            );
          }
        }
        catch(err) {
          console.log(`\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `);
        }
      }
    });

    server.route({
      method: "GET",
      path: "/css/{file*}",
      handler: {
        directory: {
          path: Path.join(__dirname, "../../../client/css")
        }
      }
    });

    server.route({
      method: "GET",
      path: "/js/{file*}",
      handler: {
        directory: {
          path: Path.join(__dirname, "../../../client/js")
        }
      }
    });

    server.route({
      method: "GET",
      path: "/service-worker.js",
      handler: async function(request, h) {
        try {
          return await h.file(
            Path.join(__dirname, "../../../client/service-worker.js")
          );
        }
        catch(err) {
          console.log(`\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `);
        }
      }
    });

    server.route({
      method: "GET",
      path: "/img/{file*}",
      handler: {
        directory: {
          path: Path.join(__dirname, "../../../client/img")
        }
      }
    });
  }
};
