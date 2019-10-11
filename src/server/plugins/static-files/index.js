// hapi's tutorial on serving static files:
// https://hapi.dev/tutorials/servingfiles/?lang=en_US

// The paths to the CSS, JavaScript, and image files need to reference the locations of those
// files in production mode only. In development mode the static files are served by Vue's
// development server. In production mode, there is no development server and that’s where hapi
// comes in to serve up the static files.

"use strict";

const Path = require("path");

exports.plugin = {
  pkg: require("./package.json"),
  register: async function(server, options) {

    server.route({
      // If you use "history" mode in Vue Router, then you need to configure your server to repond
      // to every request with the index.html file. See my "Vue.js Reference Guide" under the
      // heading "Using Vue Router’s History Mode".
      // Set the method to "*" so that the index.html file is returned with every request instead
      // of a 404 error. NOTE: When creating a SPA, any 404 errors/pages should be handled by the
      // frontend framework and not by the backend server.
      method: "*",
      path: "/{path*}",
      handler: function(request, h) {
        try {
          return h.file(
            Path.join(__dirname, "../../../client/index.html")
          );
        }
        catch(e) {
          console.error(`\n [ENDPONT]: ${request.path} \n [ERROR]: ${e} `);
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
      path: "/img/{file*}",
      handler: {
        directory: {
          path: Path.join(__dirname, "../../../client/img")
        }
      }
    });

    // -------------------------------------------------------------------------------------------------
    // I am not teaching about Progressive Web Apps in this course, so I will comment this out for now.
    // -------------------------------------------------------------------------------------------------
    // server.route({
    //   method: "GET",
    //   path: "/service-worker.js",
    //   handler: async function(request, h) {
    //     try {
    //       return await h.file(
    //         Path.join(__dirname, "../../../client/service-worker.js")
    //       );
    //     }
    //     catch(e) {
    //       console.error(`\n [ENDPONT]: ${request.path} \n [ERROR]: ${e} `);
    //     }
    //   }
    // });
  }
};
