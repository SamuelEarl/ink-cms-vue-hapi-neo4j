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
     * Create a new page
     */
    server.route({
      method: "POST",
      path: "/admin-pages/add-page",
      handler: async function(request, h) {
        let error = null;
        let pageData = null;

        try {
          const title = request.payload.title;
          // For the slug value that was entered by the user, replace any spaces with hyphens and make all characters lowercase.
          let slug = request.payload.slug.replace(/\s+/g, "-").toLowerCase();
          // If no slug is entered, then use the title as the slug.
          if (slug === "") {
            slug = title.replace(/\s+/g, "-").toLowerCase();
          }
          const content = request.payload.content;
          const sortPosition = request.payload.sortPosition;

          // See if a page already exists with the same slug.
          const pageWithSlug = await session.run(
            `MATCH (p:Page {
              slug: { slugParam }
            })
            RETURN p`, {
              slugParam: slug
            }
          );

          // If a page already exists with the same slug, then return with an error message.
          // If there are no matching nodes in a Neo4j query, then the return statement will have a
          // "records" array with length of 0, which means that there are no pages that exist with
          // the same slug. So if the "records" array has a length greater than 0, then there is a
          // page that exists with the same slug and you need to return with an error message.
          if (pageWithSlug.records.length > 0) {
            error = Boom.badRequest("A page with this slug already exists. Please choose a different slug.");
            pageData = pageWithSlug;
            return { error, pageData };
          }
          else {
            // Create new page in Neo4j
            const newPage = await session.run(
              `CREATE (p:Page {
                title: { titleParam },
                slug: { slugParam },
                content: { contentParam },
                sortPosition: { sortPositionParam }
              })
              RETURN p`, {
                titleParam: title,
                slugParam: slug,
                contentParam: content,
                sortPositionParam: sortPosition
              }
            );

            pageData = newPage;
          }

          session.close();

          return { error, pageData };
        }
        catch(err) {
          const errorMessage = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errorMessage);
        }

      }
    });

    /**
     * Reorder pages
     */
    server.route({
      method: "PUT",
      path: "/admin-pages/reorder-pages",
      handler: async function(request, h) {
        let error = null;

        try {
          const pagesList = request.payload.pagesList;

          // Loop through "pagesList" and update the "sortPosition" property of each page node in Neo4j.
          // I need to "Take advantage of parallel async operations" (see my "ES6 and Beyond" Google Doc) when reordering these pages.

          // // Find the page with the matching slug and update the "sortPosition" property.
          // const pageWithSlug = await session.run(
          //   `MATCH (p:Page {
          //     slug: { slugParam }
          //   })
          //   RETURN p`, {
          //     slugParam: slug
          //   }
          // );

          session.close();

          return error;
        }
        catch(err) {
          const errorMessage = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errorMessage);
        }

      }
    });
  }
};
