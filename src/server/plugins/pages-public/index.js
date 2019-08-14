"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

// Imports
const uuidv4 = require("uuid/v4");
const Boom = require("@hapi/boom");
const sanitizeHtml = require("sanitize-html");

exports.plugin = {
  pkg: require("./package.json"),
  register: async function(server, options) {

    // Set session to the Neo4j "session" database object
    const session = server.app.session;

    /**
     * Get the data for a public page based on the slug that is passed in "request.params.slug".
     */
    server.route({
      method: "GET",
      path: "/pages-public/get-page/{slug?}",
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let pageData = {};

        try {
          // When a user sends a request for the home page, then there will be no slug sent with
          // that request. (See the comments in "PublicPage.vue" under the "loadPageContent" method
          // for more details.)
          // If the slug exists, then set the slug variable to the existing slug. If no slug exists,
          // then that means that it is a request for the home page, so set the slug variable to
          // "home".
          const slug = request.params.slug ? request.params.slug : "home";

          // Retrieve the page content from Neo4j
          const page = await session.run(
            `MATCH (p:Page {
              slug: { slugParam }
            })
            RETURN p`, {
              slugParam: slug
            }
          );

          session.close();

          // If the page exists, then set pageData to equal the Neo4j node's properties.
          // You should always sanitize user-submitted data before they are sent to their final destination (e.g., a database or a browser). Since these data were entered by users and are being sent to the browser, we need to sanitize them before we send them to the browser.
          if (page.records.length > 0) {
            const pageProps = page.records[0]._fields[0].properties;

            // Use the sanitize-html library (https://www.npmjs.com/package/sanitize-html) to escape output that is being sent to the browser. Only the data that is in the form of HTML strings and that will be displayed in an element with the "v-html" directive needs to be escaped.
            const cleanContent = sanitizeHtml(pageProps.content, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat([ "img" ]),
              allowedAttributes: {
                img: [ "src", "srcset", "alt" ]
              }
            });

            // Set "pageData.title" and "pageData.content" to equal the sanitized versions of their
            // data before they are sent to the browser.
            pageData.title = pageProps.title;
            pageData.content = cleanContent;
          }
          // Otherwise set "flash" to an error message and throw an error.
          else {
            flash = `The page with slug "${slug}" does not exist.`;
            throw new Error(flash);
          }
        }
        catch(e) {
          error = new Boom(e);
          const errorLog = `[ENDPOINT]: ${request.path}\n[ERROR]: ${error}`;
          console.error(errorLog);
        }
        finally {
          return { error, flash, pageData };
        }
      }
    });

  }
};
