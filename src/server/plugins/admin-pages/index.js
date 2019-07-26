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
// Use Joi to prevent a user from adding a page with "home" as the slug.
    server.route({
      method: "POST",
      path: "/admin-pages/create-page",
      handler: async function(request, h) {
        let error = null;
        let pageData = null;
        const uuid = uuidv4();
        const currentTime = new Date().getTime();
        const pageId = `${uuid}-${currentTime}`;

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

          /**
           * If a page already exists with the same slug, then return with an error message.
           * If there are no matching nodes in a Neo4j query, then the return statement will have a
           * "records" array with length of 0, which means that there are no pages that exist with
           * the same slug. So if the "records" array has a length of 0, then create a new page in
           * Neo4j. If the "records" array has a length greater than 0, then there is a page that
           * exists with the same slug and you need to return with an error message.
           */
          if (pageWithSlug.records.length > 0) {
            error = Boom.badRequest("A page with this slug already exists. Please choose a different slug.");
            pageData = pageWithSlug;
            return { error, pageData };
          }
          else {
            // Create new page in Neo4j
            const newPage = await session.run(
              `CREATE (p:Page {
                id: { idParam },
                title: { titleParam },
                slug: { slugParam },
                content: { contentParam },
                sortPosition: { sortPositionParam }
              })
              RETURN p`, {
                idParam: pageId,
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
     * Edit an existing page
     */
    server.route({
      method: "PUT",
      path: "/admin-pages/edit-page",
      handler: async function(request, h) {
        let error = null;
        let pageData = null;
        const id = request.payload.id;
        // I don't think I will worry about trying to reserve the "home" slug for only the home page.
        // The home page is the only one that won't have a slug at first the beginning, so
        const slug = request.payload.slug ? request.payload.slug : "home";

        try {
          // // See if a page already exists with the same slug.
          // const pageWithSlug = await session.run(
          //   `MATCH (p:Page {
          //     slug: { slugParam }
          //   })
          //   RETURN p`, {
          //     slugParam: slug
          //   }
          // );

          /**
           * If a page already exists with the same slug, then return with an error message.
           * If there are no matching nodes in a Neo4j query, then the return statement will have a
           * "records" array with length of 0, which means that there are no pages that exist with
           * the same slug. So if the "records" array has a length of 0, then create a new page in
           * Neo4j. If the "records" array has a length greater than 0, then there is a page that
           * exists with the same slug and you need to return with an error message.
           */
          if (pageWithSlug.records.length > 0) {
            error = Boom.badRequest("A page with this slug already exists. Please choose a different slug.");
            pageData = pageWithSlug;
            return { error, pageData };
          }
          else {
            // Create new page in Neo4j
            const newPage = await session.run(
              `CREATE (p:Page {
                id: { idParam },
                title: { titleParam },
                slug: { slugParam },
                content: { contentParam },
                sortPosition: { sortPositionParam }
              })
              RETURN p`, {
                idParam: pageId,
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
                  id: { idParam }
                })
                SET p.sortPosition={ sortPositionParam }
                RETURN p`, {
                  idParam: page.id,
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
            // console.log("pagePromise:", pagePromise);
            // Log the DB response along with the response payload
            resolvedPromise.records.forEach(async function(record) {
              reorderedPages.push(record._fields[0].properties);
            });
          }

          // Cannot read property 'forEach' of undefined
          // pagesListPromises.records.forEach(async function(record) {
          //   await reorderedPages.push(record._fields[0].properties);
          // });

          console.log("reorderedPages:", reorderedPages);

          return { boomError, reorderedPages };
        }
        catch(err) {
          const errorMessage = `\n [ENDPONT]: ${request.path} \n [ERROR]: ${err} `;
          console.log(errorMessage);
          boomError = Boom.badRequest(err);
          return { boomError, reorderedPages };
        }

      }
    });
  }
};
