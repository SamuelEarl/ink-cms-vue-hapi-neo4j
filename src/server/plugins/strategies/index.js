// This plugin configures authentication strategies for the app.

"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

// Imports
const Boom = require("@hapi/boom");

exports.plugin = {
  pkg: require("./package.json"),
  dependencies: ["database"],
  register: async function(server, options) {

    // Set session to the Neo4j "session" database object
    const session = server.app.session;

    server.auth.strategy("userSession", "cookie", {
      // Configure the user's session cookie
      cookie: {
        name: "sid", // This is also the default cookie name
        // This password will be used to encrypt the cookie. Do not use the password that I have
        // inserted here. You should use your own password. You can generate your own secure
        // password here: https://www.lastpass.com/password-generator. The password should be at
        // least 32 characters long.
        password: "$2Kqvl2@WR^dOq04q7ATykmMUes%2Jq&SPj%GyZ0V@CVhjn0*%",
        // During development you often work over HTTP. The following two options might require you to work over HTTPS unless they are set to false. So to avoid unnecessary errors during development you should set the following two options to false.
        isSameSite: NODE_ENV === "production" ? "Strict" : false, // false for all environments except for production
        isSecure: NODE_ENV === "production", // false for all environments except for production
      },
      validateFunc: async (request, userSession) => {
        // See if a user exists with a matching "sessionId".
        const existingUser = await session.run(
          `MATCH (u:User {
            sessionId: { sessionIdParam }
          })
          RETURN u`, {
            sessionIdParam: userSession.id
          }
        );

        session.close();

        // If no user exists with a matching session ID, then set "valid" to false.
        if (existingUser.records.length === 0) {
          return { valid: false };
        }

        // If a user does exist with a matching session ID, then create an object representing the
        // authenticated user and pass that object to the "credentials" property.
        const { firstName, lastName, email, isVerified, scope } = existingUser.records[0]._fields[0].properties;
        const userCredentials = { firstName, lastName, email, isVerified, scope };

        return { valid: true, credentials: userCredentials };
      }
    });

    // You can set the default strategy here, but we are going to configure the routes individually.
    // server.auth.default("userSession");
  }
};
