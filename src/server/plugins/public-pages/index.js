"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

// Imports
const uuidv4 = require("uuid/v4");
const Boom = require("@hapi/boom");

exports.plugin = {
  pkg: require("./package.json"),
  register: async function(server, options) {

    // Set session to the Neo4j "session" database object
    const session = server.app.session;

    /**
     * Get an individual page
     */
// Use the sanitize-html library (https://www.npmjs.com/package/sanitize-html) to escape output that is being sent to the browser. Only the data that is in the form of HTML strings and that will be displayed in an element with the "v-html" directive needs to be escaped.
    server.route({
      method: "GET",
      path: "/public-pages/get-page/{slug?}",
      handler: async function(request, h) {
        const slug = request.params.slug ? request.params.slug : "home";
        let pageData = null;

        try {
          // Retrieve the page content from Neo4j
          const page = await session.run(
            `MATCH (p:Page {
              slug: { slugParam }
            })
            RETURN p`, {
              slugParam: slug
            }
          );

          if (page.records.length > 0) {
            pageData = page.records[0]._fields[0].properties;
          }

          session.close();

          return { pageData };
        }
        catch(err) {
          const errorMessage = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errorMessage);
        }

      }
    });


    /**
     * Get all pages
     */
    server.route({
      method: "GET",
      path: "/public-pages/get-all-pages",
      handler: async function(request, h) {

        try {
          // Retrieve all pages from Neo4j
          const pages = await session.run(
            `MATCH (p:Page)
            RETURN p
            ORDER BY p.sortPosition`
          );

          const pagesArray = [];
          pages.records.forEach(function(record) {
            pagesArray.push(record._fields[0].properties);
          });

          session.close();

          return pagesArray;
        }
        catch(err) {
          const errorMessage = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errorMessage);
        }

      }
    });

  }
};
