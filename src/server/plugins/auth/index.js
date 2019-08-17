"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

// Imports
const uuidv4 = require("uuid/v4");
const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const Bcrypt = require("bcrypt");

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

        const { firstName, lastName, email, scope } = existingUser.records[0]._fields[0].properties;
        const userCredentials = { firstName, lastName, email, scope };

        return { valid: true, credentials: userCredentials };
      }
    });

    // You can set the default strategy here, but we are going to configure the routes individually.
    // server.auth.default("userSession");

    /**
     * Create a new user
     */
    server.route({
      method: "POST",
      path: "/register",
      options: {
        // If you validate even one field from your payload with Joi, then you have to validate all
        // fields from your payload. Otherwise you will get very confusing errors.
        validate: {
          payload: {
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(200).required().strict(),
            confirmPassword: Joi.string().valid(Joi.ref("password")).required().strict()
          }
        }
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let user = {};

        try {
          const userUuid = uuidv4();
          const sessionUuid = uuidv4();
          const currentTime = new Date().getTime();
          const userId = `${userUuid}-${currentTime}`;
          const sessionId = `${sessionUuid}-${currentTime}`;
          const { firstName, lastName, email, password } = request.payload;

          // See if a user already exists with the same email.
          const existingUser = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            RETURN u`, {
              emailParam: email
            }
          );

          // If a user already exists with this email, then set "flash" to an error message and
          // throw an error.
          if (existingUser.records.length > 0) {
            flash = "A user with this email already exists. Please use a different email address.";
            throw new Error(flash);
          }

          // Hash the password before it is stored in the database.
          // See https://www.npmjs.com/package/bcrypt.
          const saltRounds = 10;
          const hash = await Bcrypt.hash(password, saltRounds);

          let scope = ["user"];
          if (email === process.env.ADMIN_EMAIL) {
            scope = [ ...scope, "admin" ];
          }

          // Otherwise create a new user in Neo4j and set "flash" to a success message.
          const newUser = await session.run(
            `CREATE (u:User {
              userId: { userIdParam },
              sessionId: { sessionIdParam },
              email: { emailParam },
              firstName: { firstNameParam },
              lastName: { lastNameParam },
              password: { passwordParam },
              scope: { scopeParam }
            })
            RETURN u`, {
              userIdParam: userId,
              sessionIdParam: sessionId,
              emailParam: email,
              firstNameParam: firstName,
              lastNameParam: lastName,
              passwordParam: hash,
              scopeParam: scope
            }
          );

          session.close();

          const newUserSessionId = newUser.records[0]._fields[0].properties.sessionId;
          const newUserFirstName = newUser.records[0]._fields[0].properties.firstName;
          const newUserLastName = newUser.records[0]._fields[0].properties.lastName;
          const newUserEmail = newUser.records[0]._fields[0].properties.email;
          const newUserScope = newUser.records[0]._fields[0].properties.scope;
          user = { newUserFirstName, newUserLastName, newUserEmail, newUserScope };

          // "id" is the "userSession.id" that is used in the "cookie" strategy.
          // I am setting "id" to a new "sessionId" that is created each time a user logs in.
          request.cookieAuth.set({ id: newUserSessionId });

          flash = `"${newUserFirstName} ${newUserLastName}" has successfully registered!`;
        }
        catch(e) {
          const msg = "Error while attempting to create a new user.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash, user };
        }
      }
    });


    /**
     * Login
     */
    server.route({
      method: "POST",
      path: "/login",
      options: {
        validate: {
          payload: {
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(200).required().strict()
          }
        },
        auth: {
          strategy: "userSession",
          // A user is not required to be logged in before they can login. Obviously.
          // The example in the @hapi/cookie GitHub page uses the "try" mode, so I am using it here
          // too. See https://github.com/hapijs/cookie.
          mode: "try"
        }
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let user = null;

        try {
          const uuid = uuidv4();
          const currentTime = new Date().getTime();
          const { email, password } = request.payload;

          // See if a user exists with this email.
          const existingUser = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            RETURN u`, {
              emailParam: email
            }
          );

          // If no user exists with the above email or the password does not match the one stored in
          // the database, then set "flash" to an error message and throw an error.
          if (existingUser.records.length === 0 || !(await Bcrypt.compare(password, existingUser.records[0]._fields[0].properties.password))) {
            flash = "The email or password that you provided does not match our records. Do you need to register for an account?";
            throw new Error(flash);
          }

          // Otherwise set the new sessionId in the database.
          const newSessionId = `${uuid}-${currentTime}`;

          // Set a new sessionId for this user.
          const userAccount = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            SET u.sessionId={ sessionIdParam }
            RETURN u`, {
              emailParam: email,
              sessionIdParam: newSessionId
            }
          );

          session.close();

          // Set the user objcet that will be returned to the browser.
          // There is probably no need to run an "if" conditional check here to see if this user
          // account exists (e.g., userAccount.records.length === 1) because we already tested
          // that above.
          const sessionIdFromDb = userAccount.records[0]._fields[0].properties.sessionId;
          const userFirstName = userAccount.records[0]._fields[0].properties.firstName;
          const userLastName = userAccount.records[0]._fields[0].properties.lastName;
          const userEmail = userAccount.records[0]._fields[0].properties.email;
          const userScope = userAccount.records[0]._fields[0].properties.scope;
          user = { userFirstName, userLastName, userEmail, userScope };

          // Set the user session object that will create the cookie (with request.cookieAuth.set()).
          // "id" is the "userSession.id" that is used in the "cookie" strategy.
          // I am setting "id" to a new "sessionId" that is created each time a user logs in.
          request.cookieAuth.set({ id: sessionIdFromDb });

          // Set "flash" to a success message.
          flash = `"${userFirstName} ${userLastName}" has successfully logged in!`;
        }
        catch(e) {
          const msg = "Login error. Please try again.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash, user };
        }
      }
    });


    /**
     * Logout
     */
    server.route({
      method: "GET",
      path: "/logout",
      options: {
        // The auth option can be configured because you would have to be logged in first before
        // you could logout, right? But I am going to set "mode" to "try" just to make sure that
        // users can logout under any circumstances (e.g., maybe the user deleted their cookies or
        // their account was accidentally deleted while they were logged in).
        auth: {
          strategy: "userSession",
          mode: "try"
        }
      },
      handler: function(request, h) {
        let error = null;
        let flash = null;

        try {
          // Clear the cookie. If a user does not have a valid cookie, then they are not logged in.
          request.cookieAuth.clear();
          flash = "You have successfully logged out.";
        }
        catch(e) {
          const msg = "Logout error. Please try again.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash };
        }
      }
    });


    server.route({
      method: "GET",
      path: "/users/get-all-users",
      options: {
        auth: {
          strategy: "userSession",
          mode: "required",
          access: {
            // If the user does not have the proper permissions, then hapi will return a 403 Forbidden error.
            scope: ["admin"]
          }
        }
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let usersList = [];

        try {
          const users = await session.run("MATCH (u:User) RETURN u");

          users.records.forEach(function(record) {
            // "record._fields[0]" returns each node in the array
            usersList.push(record._fields[0].properties);
          });

          session.close();
        }
        catch(e) {
          const errorRes = server.methods.catch(e, null, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash, usersList };
        }
      }
    });


    server.route({
      method: "PUT",
      path: "/users/update-user-scope",
      options: {
        auth: {
          strategy: "userSession",
          mode: "required",
          access: {
            scope: ["admin"]
          }
        }
      },
      handler: async function(request) {
        let error = null;
        let flash = null;
        let userScope = [];

        try {
          const userId = request.payload.userId;
          const updatedScopeArray = request.payload.updatedScopeArray;

          const userNodeWithUpdatedScope = await session.run(
            `MATCH (u:User {
              userId: { userIdParam }
            })
            SET u.scope={ scopeParam }
            RETURN u`, {
              userIdParam: userId,
              scopeParam: updatedScopeArray
            }
          );

          session.close();

          // Set "userNode" and a success flash message
          userScope = userNodeWithUpdatedScope.records[0]._fields[0].properties.scope;
          flash = "User scope updated successfully!";
        }
        catch(e) {
          const errorRes = server.methods.catch(e, null, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash, userScope };
        }
      }
    });

  }
};
