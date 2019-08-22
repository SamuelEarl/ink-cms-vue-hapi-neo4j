"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

// Imports
const uuidv4 = require("uuid/v4");
const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const Bcrypt = require("bcrypt");
const Crypto = require("crypto");
const Nodemailer = require("nodemailer");

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
        let redirect = false;
        // let user = {};

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

          session.close();

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

          const token = Crypto.randomBytes(16).toString("hex");
          const timestamp = Date.now();

          // Create a new user, a token node, and the relationship between the two.
          await session.run(
            `CREATE (u:User {
              userId: { userIdParam },
              sessionId: { sessionIdParam },
              firstName: { firstNameParam },
              lastName: { lastNameParam },
              email: { emailParam },
              password: { passwordParam },
              isVerified: { isVerifiedParam },
              scope: { scopeParam }
            })
            CREATE (t:Token {
              token: { tokenParam },
              createdAt: { timestampParam }
            })
            MERGE (u)-[r:USER_EMAIL_VERIFICATION_TOKEN { createdAt: { timestampParam } }]->(t)
            RETURN u,t,r`, {
              userIdParam: userId,
              sessionIdParam: sessionId,
              firstNameParam: firstName,
              lastNameParam: lastName,
              emailParam: email,
              passwordParam: hash,
              isVerifiedParam: false,
              scopeParam: scope,
              tokenParam: token,
              timestampParam: timestamp
            }
          );

          session.close();

          // const userProps = registeredUser.records[0]._fields[0].properties;

          // Send the email
          const transporter = Nodemailer.createTransport({
            service: "Sendgrid", auth: {
              user: process.env.SENDGRID_USERNAME,
              pass: process.env.SENDGRID_PASSWORD
            }
          });

          const host = request.headers.host;

          const confUrl = `http${NODE_ENV === "production" ? "s" : ""}://${NODE_ENV === "production" ? host : "localhost:8080"}/verify/${token}`;

          const mailOptions = {
            from: "no-reply@yourwebapplication.com",
            to: email,
            subject: "Verify your account",
            // If you place the text in between string literals (``), then the text in the email
            // message might display in monospaced font.
            text: "Hello " + firstName + ",\n\nPlease verify your account by clicking the link:\n\n" + confUrl + ".\n\n"
            // html: `<p>Hello ${firstName},</p> <p>Please verify your account by clicking the link:</p> <p>${confUrl}.</p>`
          };

          await transporter.sendMail(mailOptions);

          // const newUserSessionId = newUser.records[0]._fields[0].properties.sessionId;
          // const newUserFirstName = newUser.records[0]._fields[0].properties.firstName;
          // const newUserLastName = newUser.records[0]._fields[0].properties.lastName;
          // const newUserEmail = newUser.records[0]._fields[0].properties.email;
          // const newUserScope = newUser.records[0]._fields[0].properties.scope;
          // user = { newUserFirstName, newUserLastName, newUserEmail, newUserScope };

          // Once the user has successfully registered, you can set the session cookie so that the
          // user is automatically logged in (as opposed to requiring the user to login separately
          // after they have registered).
          // "id" is the "userSession.id" that is used in the "cookie" strategy.
          // I am setting "id" to a new "sessionId" that is created each time a user logs in.
          // request.cookieAuth.set({ id: newUserSessionId });


          // Set "redirect" to true.
          // I will probably only send a "redirect" property and if that property is true, then the user will be redirected to a page that instructs them to verify their email address.
          redirect = true;
          // flash = `"${newUserFirstName} ${newUserLastName}" has successfully registered!`;
        }
        catch(e) {
          // Make sure to provide a default error message for this route in the false condition of
          // the following ternary operator.
          const msg = e.message ? e.message : "Error while attempting to create a new user.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          // return { error, flash, user };
          return { error, flash, redirect };
        }
      }
    });


    /**
     * Verify email using a registration token
     */
    server.route({
      method: "GET",
      path: "/verify",
      options: {

      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;

        try {
          //
        }
        catch(e) {
          const msg = e.message ? e.message : "Error while attempting to verify email.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash };
        }
      }
    });


// I will probably need a button for "Resend Verification" on both the LoginRegister and EmailVerified pages that users can click to resend the token.
// I need to think through a few simple scenarios that will hanlde all of the possible "Resend Verification" situations.
// If a user has already tried to register, but has not verified their token, and they try to login, then I will send a flash message telling them "Your email address has not been verified. Please check your email account for a verification link." If their token has expired and they try to login, then I will tell them "Your verification link has expired. Please click 'Resend Verification' below."
// If the user has been sent a verification token and it has not yet expired and the user tries to register again, then I will tell them "A verification link has already been sent to your email account. Please click that link."
    /**
     * Resend verification token
     */
    server.route({
      method: "POST",
      path: "/resend-verification-token",
      options: {

      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;

        try {
          //
        }
        catch(e) {
          const msg = e.message ? e.message : "Error while attempting to resend verification email.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash };
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

          // If the user has not verified their email address, then set "flash" to an error message
          // and throw an error.
          if (!existingUser.records[0]._fields[0].properties.isVerified) {
            flash = "You have not verified your email address.";
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
          const msg = e.message ? e.message : "Login error. Please try again.";
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
          const msg = e.message ? e.message : "Logout error. Please try again.";
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
