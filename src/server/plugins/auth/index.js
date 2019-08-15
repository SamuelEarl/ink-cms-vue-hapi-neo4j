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
     * Create a new user
     */
    server.route({
      method: "POST",
      path: "/auth/create-new-user",
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let user = null;

        try {
          const uuid = uuidv4();
          const currentTime = new Date().getTime();
          const userId = `${uuid}-${currentTime}`;
          const userProfle = request.payload;
          const email = userProfle.email;
          const firstName = userProfle.firstName;
          const lastName = userProfle.lastName;

          // See if a user already exists with the same email.
          const userNode = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            RETURN u`, {
              emailParam: email
            }
          );

          /**
           * If there are no matching nodes in the Neo4j query, then the return statement will have
           * a "records" array with length of 0, which means that there are no pages that exist with
           * the same slug. So if the "records" array has a length of 0, then create a new page in
           * Neo4j. If the "records" array has a length greater than 0, then there is a page that
           * exists with the same slug, so set "flash" to an error message and throw an error.
           */
          // If a page already exists with the same slug, then set "flash" to an error message and
          // throw an error.
          if (userNode.records.length > 0) {
            flash = "A user with this email already exists. Please enter a different email address.";
            throw new Error(flash);
          }
          // Otherwise create a new user in Neo4j and set "flash" to a success message.
          else {
            await session.run(
              `CREATE (u:User {
                userId: { userIdParam },
                email: { emailParam },
                firstName: { firstNameParam },
                lastName: { lastNameParam }
              })
              RETURN u`, {
                userIdParam: userId,
                emailParam: email,
                firstNameParam: firstName,
                lastNameParam: lastName
              }
            );

            user = userNode.records[0]._fields[0].properties;
            console.log("USER OBJECT:", user);

            flash = `Profile for "${firstName} ${lastName}" was successfully created!`;
            // NOTE: If there is an error while trying to create the new user in Neo4j, then the
            // execution will skip to the "catch" block where you can handle the error and return
            // an flash message to the user as user feedback.
          }

          session.close();
        }
        catch(e) {
          const msg = "Error while attempting to create a new user!";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          // Return the error and flash message to the user to provide user feedback.
          // NOTE: If there is an error, then in the "onPreResponse" hook the "error" variable will
          // be set to the HTTP status message (e.g., "Bad Request", "Internal Server Error") and
          // the "flash" variable will be set to the error message that is derived from
          // `error.message` (e.g., "An internal server error occurred").
          return { error, flash, user };
        }
      }
    });
  }
};
