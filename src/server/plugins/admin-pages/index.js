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
      path: "/admin-pages/create-page",
      handler: async function(request, h) {
        let error = null;
        let flash = null;

        try {
          const uuid = uuidv4();
          const currentTime = new Date().getTime();
          const pageId = `${uuid}-${currentTime}`;
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
          const pageWithMatchingSlug = await session.run(
            `MATCH (p:Page {
              slug: { slugParam }
            })
            RETURN p`, {
              slugParam: slug
            }
          );

          /**
           * If there are no matching nodes in the Neo4j query, then the return statement will have
           * a "records" array with length of 0, which means that there are no pages that exist with
           * the same slug. So if the "records" array has a length of 0, then create a new page in
           * Neo4j. If the "records" array has a length greater than 0, then there is a page that
           * exists with the same slug, so set "flash" to an alert message and "error" to a Boom
           * error.
           */
          // If a page already exists with the same slug, then set "flash" to an alert message and
          // "error" to a Boom error.
          if (pageWithMatchingSlug.records.length > 0) {
            flash = "A page with this slug already exists. Please choose a different slug.";
            error = Boom.badRequest(flash);
          }
          // Otherwise create a new page in Neo4j and set "flash" to a success message.
          else {
            await session.run(
              `CREATE (p:Page {
                pageId: { pageIdParam },
                title: { titleParam },
                slug: { slugParam },
                content: { contentParam },
                sortPosition: { sortPositionParam }
              })
              RETURN p`, {
                pageIdParam: pageId,
                titleParam: title,
                slugParam: slug,
                contentParam: content,
                sortPositionParam: sortPosition
              }
            );

            flash = "New page successfully created!";
            // NOTE: If there is an error while trying to create the new page in Neo4j, then the
            // execution will skip to the "catch" block where you can handle the error and return
            // an alert message to the user as user feedback.
          }

          session.close();

          return { error, flash };
        }
        catch(err) {
          // Log the error...
          const errMsg = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errMsg);
          // ...and return the error to the user to provide user feedback.
          flash = err;
          error = Boom.badRequest(flash);
          return { error, flash };
        }
      }
    });


    /**
     * Get the page data for the "Edit page" view
     */
    server.route({
      method: "GET",
      path: "/admin-pages/edit-page/{pageId}",
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let pageData = null;

        try {
          const pageId = request.params.pageId;

          // Find the page node with the matching pageId.
          const pageWithMatchingId = await session.run(
            `MATCH (p:Page {
              pageId: { pageIdParam }
            })
            RETURN p`, {
              pageIdParam: pageId
            }
          );

          session.close();

          /**
           * If there are no matching nodes from the Neo4j query, then the return statement will
           * have a "records" array with length of 0, which means that there are no pages that exist
           * with a matching pageId. So if the "records" array has a length of 0, then return an
           * error. If the "records" array has a length greater than 0, then there is a page with a
           * matching pageId, so return the pageData.
           */
          // If the page exists, then set pageData to equal the node's properties.
          if (pageWithMatchingId.records.length > 0) {
            pageData = pageWithMatchingId.records[0]._fields[0].properties;
          }
          // Otherwise set "flash" to an alert message and "error" to a Boom error.
          else {
            flash = "That page does not exist.";
            error = Boom.badRequest(flash);
          }

          return { error, flash, pageData };
        }
        catch(err) {
          // Log the error...
          const errMsg = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errMsg);
          // ...and return the error to the user to provide user feedback.
          flash = err;
          error = Boom.badRequest(flash);
          return { error, flash, pageData };
        }
      }
    });


    /**
     * Edit (or update) the data for an existing page
     */
    server.route({
      method: "PUT",
      path: "/admin-pages/edit-page/{pageId}",
      handler: async function(request, h) {
        let error = null;
        let flash = null;

        try {
          const pageId = request.params.pageId;
          const title = request.payload.title;
          // For the slug value that was entered by the user, replace any spaces with hyphens and make all characters lowercase.
          let slug = request.payload.slug.replace(/\s+/g, "-").toLowerCase();
          // If no slug is entered, then use the title as the slug.
          if (slug === "") {
            slug = title.replace(/\s+/g, "-").toLowerCase();
          }
          const content = request.payload.content;

          // See if the slug is unique or if another page is already using this slug. If you find
          // another node that has the same slug but has a different ID than the current node, then
          // you know that the slug you are trying to use is not unique and you need to use a
          // different slug.
          const pageWithMatchingSlug = await session.run(
            `MATCH (p:Page {
              slug: { slugParam },
              pageId: { pageIdParam }
            })
            RETURN p`, {
              slugParam: slug,
              pageIdParam: { pageId }
            }
          );

          /**
           * If there are no matching nodes in the Neo4j query, then the return statement will have
           * a "records" array with length of 0, which means that there are no pages that exist with
           * the same slug. So if the "records" array has a length of 0, then update the existing
           * page in Neo4j. If the "records" array has a length greater than 0, then there is a page
           * that exists with the same slug, so set "flash" to an alert message and "error" to a
           * Boom error.
           */
          // If a page already exists with the same slug, then set "flash" to an alert message and
          // "error" to a Boom error.
          if (pageWithMatchingSlug.records.length > 0) {
            flash = "A page with this slug already exists. Please choose a different slug.";
            error = Boom.badRequest(flash);
          }
          // Otherwise update the existing page in Neo4j and set "flash" to a success message.
          else {
            await session.run(
              `MATCH (p:Page {
                pageId: { pageIdParam }
              })
              SET
                p.title={ titleParam },
                p.slug={ slugParam },
                p.content={ contentParam }
              RETURN p`, {
                pageIdParam: pageId,
                titleParam: title,
                slugParam: slug,
                contentParam: content
              }
            );

            flash = "Page successfully updated!";
            // NOTE: If there is an error while trying to create the new page in Neo4j, then the
            // execution will skip to the "catch" block where you can handle the error and return
            // a flash message to the user as user feedback.
          }

          session.close();

          return { error, flash };
        }
        catch(err) {
          // Log the error...
          const errMsg = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errMsg);
          // ...and return the error and flash message to the user to provide user feedback.
          flash = err;
          error = Boom.badRequest(flash);
          return { error, flash };
        }
      }
    });


    /**
     * Delete the node for an existing page
     */
    server.route({
      method: "DELETE",
      path: "/admin-pages/delete-page",
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        const pageId = request.payload.pageId;
        const title = request.payload.title;

        try {
          await session.run(
            `MATCH (p:Page {
              pageId: { pageIdParam }
            })
            DELETE p
            RETURN p`, {
              pageIdParam: pageId
            }
          );

          session.close();

          flash = `The "${title}" page was successfully deleted!`;
        }
        catch(e) {
          // Be careful that you do not send error messages to the client that could give sensitive
          // information about the internals of your system.

          // Set the error message to a Boom error and log the error for internal use.
          // Boom errors are safe to send back to the client.
          error = new Boom(e);
          console.log(` [ENDPOINT]: ${request.path} \n [ERROR]: ${error} `);
        }
        finally {
          // Return the error and flash message to the user to provide user feedback.
          // NOTE: If there is an error, then in the "onPreResponse" hook the "error" variable will
          // be set to the HTTP status message (e.g., "Bad Request", "Internal Server Error") and
          // the "flash" variable will be set to the error message that is derived from
          // `error.message` (e.g., "An internal server error occurred").
          return { error, flash };
        }
      }
    });


// I need to update this endpoint to match the ones above (with flash and error messages).
    /**
     * Reorder pages
     */
    server.route({
      method: "PUT",
      path: "/admin-pages/reorder-pages",
      handler: async function(request, h) {
        let boomError = null;
        let reorderedPages = [];
        const pagesList = request.payload.pagesList;

        try {
          // Loop through the "pagesList" array and update the "sortPosition" property of each page node in Neo4j.
          // This code takes advantage of parallel async operations, which is more efficient and faster than if the code was written serially. The database call is an async operation that returns a promise. map() will push each returned promise into an array. Once the promises are in the array, they can settle in parallel. Then a for loop will iterate over that array using the "await" keyword to resolve each promise. The data from the resolved promises is then pushed into a new array that is returned to the user.
          const pagesListPromises = pagesList.map(async (page, index) => {
            try {
              const response = await session.run(
                `MATCH (p:Page {
                  pageId: { pageIdParam }
                })
                SET p.sortPosition={ sortPositionParam }
                RETURN p`, {
                  pageIdParam: page.pageId,
                  sortPositionParam: index
                }
              );

              return response;
            }
            catch(err) {
              console.log(err);
            }
          });

          session.close();

          // I need to show the JSON of a Neo4j record with an explanation of what each part means. Then I can clearly explain this next part.

          // The "records[i]._fields[i].properties" property is an object that contains the properties of the node that is returned. For every node that is returned from the query, we are going to push that "properties" object into an array. The result will be an array of objects and we will return that array of objects to the browser. (Or should we simply return a success message?)
          for (const pagePromise of pagesListPromises) {
            const resolvedPromise = await pagePromise;
            resolvedPromise.records.forEach(async function(record) {
              reorderedPages.push(record._fields[0].properties);
            });
          }

          return { boomError, reorderedPages };
        }
        catch(err) {
          const errMsg = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errMsg);
          boomError = Boom.badRequest(err);
          return { boomError, reorderedPages };
        }

      }
    });
  }
};
