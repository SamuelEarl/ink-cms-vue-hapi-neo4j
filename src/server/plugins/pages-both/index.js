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

    /**
     * Get all pages. The "setPagesListAction" in the "pages" Vuex module calls this endpoint and
     * populates the "pagesList" array with the returned values from this endpoint. The header and
     * the "PagesList.vue" component are populated with the data from the "pagesList" array.
     */
    server.route({
      method: "GET",
      path: "/pages-both/get-all-pages",
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        const pagesArray = [];

        try {
          // Retrieve all pages from Neo4j
          const pages = await session.run(
            `MATCH (p:Page)
            RETURN p
            ORDER BY p.sortPosition`
          );

          session.close();

          pages.records.forEach(function(record) {
            pagesArray.push(record._fields[0].properties);
          });
        }
        catch(e) {
          error = new Boom("Unable to retrieve pages");
          const errorLog = `[ENDPOINT]: ${request.path}\n[ERROR]: ${error}`;
          console.error(errorLog);
        }
        finally {
          return { error, flash, pagesArray };
        }
      }
    });

  }
};
