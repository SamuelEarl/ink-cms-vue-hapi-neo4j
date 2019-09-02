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
     * Create a new user.
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

          // If this user has already registered, but they have not verified their email address, then close the database connection, set "flash" to an error message, and throw an error.
          if (existingUser.records.length > 0 && !existingUser.records[0]._fields[0].properties.isVerified) {
            session.close();
            flash = "You have not verified your email address. Click the link below to send a new verification email.";
            throw new Error(flash);
          }

          // If a user already exists with this email, then close the database connection, set "flash" to an error message, and throw an error.
          if (existingUser.records.length > 0 && existingUser.records[0]._fields[0].properties.isVerified) {
            session.close();
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

          // NOTES:
          // The Neo4j APOC library has a feature that allows you to expire nodes after a specified amount of time. However, I will show how to use APOC in an advanced course instead of this course.
          // I will not use the APOC library in this tutorial because that will be too complicated to setup for newbies. So when a user registers, I will still create a separate node for the token (to show how to create multiple nodes in one query and connect them with a relationship), but the timestamp for the createdAt field will be set to 24 hours in the future.

          const token = Crypto.randomBytes(16).toString("hex");
          const timestamp = Date.now() + 86400000; // 24 hours = 86400000 milliseconds
          // const timestamp = Date.now() + 3000; // 3 seconds = 3000 milliseconds

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
            MERGE (u)-[r:EMAIL_VERIFICATION_TOKEN { createdAt: { timestampParam } }]->(t)
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

          // Send the email
          const transporter = Nodemailer.createTransport({
            service: "Sendgrid", auth: {
              user: process.env.SENDGRID_USERNAME,
              pass: process.env.SENDGRID_PASSWORD
            }
          });

          const host = request.headers.host;

          const confUrl = `http${NODE_ENV === "production" ? "s" : ""}://${NODE_ENV === "production" ? host : "localhost:8080"}/verify-email/${email}/${token}`;

          const mailOptions = {
            from: "no-reply@yourwebapplication.com",
            to: email,
            subject: "Verify your email address",
            // If you place the text in between string literals (``), then the text in the email
            // message might display in monospaced font.
            text: "Hello " + firstName + ",\n\nPlease verify your email address by clicking the link:\n\n" + confUrl + ".\n\n"
            // html: `<p>Hello ${firstName},</p> <p>Please verify your email address by clicking the link:</p> <p>${confUrl}.</p>`
          };

          await transporter.sendMail(mailOptions);
        }
        catch(e) {
          // Make sure to provide a default error message for this route in the false condition of
          // the following ternary operator.
          const msg = e.message ? e.message : "Error while attempting to create a new user.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash };
        }
      }
    });


    /**
     * Verify email using a registration token
     */
    server.route({
      method: "GET",
      path: "/verify-email/{email}/{token}",
      options: {
        // validate: {
        //   params: {
        //     email: Joi.string().email().required(),
        //     token: Joi.string().required()
        //   }
        // },
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let cta = null;
        const email = request.params.email;
        const token = request.params.token;

        try {
          // In this route, after the node with the matching token is found and the user's "isVerified" property is set to true, then this code will manually delete the token node and the relationship (instead of automatically deleting the token node and the relationship with the APOC library and the Time To Live feature). This will be a good Neo4j query to demonstrate in the course.

          // NOTE: It is important to look for the matching User node first because if a user verifies their email address, navigates to the login page, and then clicks their browser's back button, the user will see this message on the page: `Your email address (${email}) has already been verified.`, which is accurate. If we looked for the matching Token node first and the same scenario hapened, then the user would see this message on the page: "We were unable to verify your email address. That link may have expired.", which is not accurate.

          // Find a user node with the matching email.
          const userNode = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            RETURN u`, {
              emailParam: email
            }
          );

          // If no User node exists with the above email, then close the database connection,
          // set "flash" to an error message, and throw an error.
          if (userNode.records.length === 0) {
            session.close();
            flash = "We were unable to find a user associated with that email address.";
            cta = "register";
            throw new Error(flash);
          }

          // If the user's email address has already been verified, then close the database
          // connection, set "flash" to a helpful message, and return.
          if (userNode.records[0]._fields[0].properties.isVerified) {
            session.close();
            flash = `Your email address (${email}) has already been verified.`;
            cta = "login";
            return;
          }

          const currentTime = Date.now();

          // If the above User node exists, then find a Token node with the matching token.
          const tokenNode = await session.run(
            `MATCH (t:Token {
              token: { tokenParam }
            })
            WHERE t.createdAt > { currentTimeParam }
            RETURN t`, {
              tokenParam: token,
              currentTimeParam: currentTime,

            }
          );

          // If no Token node exists with the above token or if the token has expired, then close the database connection, set "flash" to an error message, and throw an error.
          if (tokenNode.records.length === 0) {
            session.close();
            flash = "We were unable to verify your email address. That link may have expired.";
            cta = "resendVerification";
            throw new Error(flash);
          }

          // If both the User and Token nodes exist and if the user has not been verified, then set
          // the user's "isVerified" property to true, and delete the Token node and the relationship.
          await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })-[r:EMAIL_VERIFICATION_TOKEN]->(t:Token {
              token: { tokenParam }
            })
            SET u.isVerified = { isVerifiedParam }
            DELETE t,r
            RETURN u`, {
              emailParam: email,
              tokenParam: token,
              isVerifiedParam: true
            }
          );

          session.close();

          flash = `Your email address (${email}) has been verified.`;
          cta = "login";
        }
        catch(e) {
          const msg = e.message ? e.message : "Error while attempting to verify email.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash, cta };
        }
      }
    });


    /**
     * Resend verification link
     * NOTE: To keep things easy and simple for a better user experience, I do not tell users who
     * have a valid email verification token to check their email for a verification link. Instead
     * if the user has registered but has not verified their email address and if they try to
     * register again or login, then I simply tell the user to "click the link below to send a new
     * verification token". That also keeps things simpler for me as a developer because I do not
     * have to check for all sorts of scenarios. I simply delete any old verification tokens and
     * create a new one that gets sent to the user's email address.
     */
    server.route({
      method: "POST",
      path: "/resend-verification-link",
      options: {
        // validate: {
        //   payload: {
        //     email: Joi.string().email().required(),
        //   }
        // },
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        const email = request.payload.email;

        try {
          // Find a user node with the matching email.
          const userNode = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            RETURN u`, {
              emailParam: email
            }
          );

          // If no User node exists with the above email, then close the database connection,
          // set "flash" to an error message, and throw an error.
          if (userNode.records.length === 0) {
            session.close();
            flash = "We were unable to find a user associated with that email address. Please register.";
            throw new Error(flash);
          }

          // If the user's email address has already been verified, then close the database
          // connection, set "flash" to a helpful message, and return.
          if (userNode.records.length > 0 && userNode.records[0]._fields[0].properties.isVerified) {
            session.close();
            flash = `Your email address (${email}) has already been verified. Please login.`;
            return;
          }

          // If the User node exists and the user's email address has not already been verified, then:
          // (1) Delete any existing Token nodes that are associated with the user.
          // (2) Create a new the verification token node and associate it with the user.
          // (3) Send the verification email.

          // Delete any existing Token nodes that are associated with the user.
          await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })-[r:EMAIL_VERIFICATION_TOKEN]->(t:Token)
            DELETE t,r
            RETURN u`, {
              emailParam: email
            }
          );

          // Create a new verification token.
          const token = Crypto.randomBytes(16).toString("hex");
          const timestamp = Date.now() + 86400000; // 24 hours = 86400000 milliseconds
          // const timestamp = Date.now() + 3000; // 3 seconds = 3000 milliseconds

          // Find the matching user and create the token node and the relationship between the user
          // and their token.
          const userTokenRelationship = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            CREATE (t:Token {
              token: { tokenParam },
              createdAt: { timestampParam }
            })
            MERGE (u)-[r:EMAIL_VERIFICATION_TOKEN { createdAt: { timestampParam } }]->(t)
            RETURN u,t,r`, {
              emailParam: email,
              tokenParam: token,
              timestampParam: timestamp
            }
          );

          const firstName = userTokenRelationship.records[0]._fields[0].properties.firstName;

          session.close();

          // Send the email
          const transporter = Nodemailer.createTransport({
            service: "Sendgrid", auth: {
              user: process.env.SENDGRID_USERNAME,
              pass: process.env.SENDGRID_PASSWORD
            }
          });

          const host = request.headers.host;

          const confUrl = `http${NODE_ENV === "production" ? "s" : ""}://${NODE_ENV === "production" ? host : "localhost:8080"}/verify-email/${email}/${token}`;

          const mailOptions = {
            from: "no-reply@yourwebapplication.com",
            to: email,
            subject: "Verify your email address",
            // If you place the text in between string literals (``), then the text in the email
            // message might display in monospaced font.
            text: "Hello " + firstName + ",\n\nPlease verify your email address by clicking the link:\n\n" + confUrl + ".\n\n"
            // html: `<p>Hello ${firstName},</p> <p>Please verify your email address by clicking the link:</p> <p>${confUrl}.</p>`
          };

          await transporter.sendMail(mailOptions);
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


    // TODO: Finish this route and test it!!!
    /**
     * Forgot your password? Send a password reset link.
     */
    server.route({
      method: "POST",
      path: "/send-password-reset-link",
      options: {
        // validate: {
        //   payload: {
        //     email: Joi.string().email().required(),
        //   }
        // },
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        const email = request.payload.email;

        try {
          // Find a user node with the matching email.
          const userNode = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            RETURN u`, {
              emailParam: email
            }
          );

          // If no User node exists with the above email, then close the database connection,
          // set "flash" to an error message, and throw an error.
          if (userNode.records.length === 0) {
            session.close();
            flash = "We were unable to find a user associated with that email address. Please register.";
            throw new Error(flash);
          }

          // If a User node exists with the above email, then create a token, set a property on the
          // User node called "passwordResetToken" that equals the token, set another property on
          // the User node called "passwordResetExpires" that equals a timestamp that is 24 hours in
          // the future.
          const token = Crypto.randomBytes(16).toString("hex");
          const timestamp = Date.now() + 86400000; // 24 hours = 86400000 milliseconds
          // const timestamp = Date.now() + 3000; // 3 seconds = 3000 milliseconds

          const setPasswordReset = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            SET
              u.passwordResetToken = { tokenParam },
              u.passwordResetExpires = { timestampParam }
            RETURN u`, {
              emailParam: email,
              tokenParam: token,
              timestampParam: timestamp
            }
          );

          session.close();

          const firstName = setPasswordReset.records[0]._fields[0].properties.firstName;

          // Send the email
          const transporter = Nodemailer.createTransport({
            service: "Sendgrid", auth: {
              user: process.env.SENDGRID_USERNAME,
              pass: process.env.SENDGRID_PASSWORD
            }
          });

          const host = request.headers.host;

          const confUrl = `http${NODE_ENV === "production" ? "s" : ""}://${NODE_ENV === "production" ? host : "localhost:8080"}/reset-password/${email}/${token}`;

          const mailOptions = {
            from: "no-reply@yourwebapplication.com",
            to: email,
            subject: "Reset your password",
            // If you place the text in between string literals (``), then the text in the email
            // message might display in monospaced font.
            text: "Hello " + firstName + ",\n\nYou are receiving this email because you requested a password reset for your account. Please click the following link to reset your password:\n\n" + confUrl + ".\n\nIf you did not request a password reset, then ignore this email and your password will remain unchanged."
          };

          await transporter.sendMail(mailOptions);
        }
        catch(e) {
          const msg = e.message ? e.message : "Error while attempting to send password reset email.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash };
        }
      }
    });


    // TODO: Finish this route and test it.
    /**
     * Forgot your password? Check if the user's password reset token is still valid.
     */
    server.route({
      method: "GET",
      path: "/reset-password/{email}/{token}",
      options: {
        // validate: {
        //   params: {
        //     email: Joi.string().email().required(),
        //     token: Joi.string().required()
        //   }
        // },
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let cta = null;
        const email = request.params.email;
        const token = request.params.token;

        try {
          const currentTime = Date.now();

          // Find a user node with a matching "passwordResetToken" and a "passwordResetExpires"
          // property that has not expired.
          const userNode = await session.run(
            `MATCH (u:User {
              passwordResetToken: { tokenParam }
            })
            WHERE u.passwordResetExpires > { currentTimeParam }
            RETURN u`, {
              tokenParam: token,
              currentTimeParam: currentTime,
            }
          );

          console.log("FIRED 2!");


          session.close();

          // If no User node exists with the above passwordResetToken, then set "flash" to an error
          // message and throw an error.
          if (userNode.records.length === 0) {
            flash = "Your password reset link is invalid or has expired.";
            cta = "tryAgain";
            throw new Error(flash);
          }

          // flash = `Please reset the password that is associated with this email address: ${email}.`;
          cta = "resetPassword";
        }
        catch(e) {
          const msg = e.message ? e.message : "Error while attempting to verify request for password reset.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash, cta };
        }
      }
    });


    // TODO: Finish this route and test it.
    /**
     * Forgot your password? Reset the user's password.
     */
    server.route({
      method: "POST",
      path: "/reset-password",
      options: {
        // validate: {
        //   payload: {
        //     email: Joi.string().email().required(),
        //   }
        // },
      },
      handler: async function(request, h) {
        let error = null;
        let flash = null;
        let cta = null;
        const email = request.payload.email;
        const token = request.payload.token;
        const password = request.payload.password;

        try {
          const currentTime = Date.now();

          // Find a user node with a matching "passwordResetToken" and a "passwordResetExpires"
          // property that has not expired. If there is a matching node, then update the "password"
          // property with the password that the user submitted and remove the "passwordResetToken"
          // and "passwordResetExpires" properties.
          const userNode = await session.run(
            `MATCH (u:User {
              passwordResetToken: { tokenParam }
            })
            WHERE u.passwordResetExpires > { currentTimeParam }
            SET u.password = { passwordParam }
            REMOVE
              u.passwordResetToken,
              u.passwordResetExpires
            RETURN u`, {
              tokenParam: token,
              currentTimeParam: currentTime,
              passwordParam: password
            }
          );

          session.close();

          // If no User node exists with the above passwordResetToken or if the token has expired,
          // then set "flash" to an error message and throw an error.
          if (userNode.records.length === 0) {
            flash = "Your password reset link is invalid or has expired.";
            cta = "tryAgain";
            throw new Error(flash);
          }

          // If the password was successfully updated, then send a confirmation email to the user.
          const firstName = userNode.records[0]._fields[0].properties.firstName;

          // Send the email
          const transporter = Nodemailer.createTransport({
            service: "Sendgrid", auth: {
              user: process.env.SENDGRID_USERNAME,
              pass: process.env.SENDGRID_PASSWORD
            }
          });

          const mailOptions = {
            from: "no-reply@yourwebapplication.com",
            to: email,
            subject: "Your password has been reset",
            // If you place the text in between string literals (``), then the text in the email
            // message might display in monospaced font.
            text: "Hello " + firstName + ",\n\nThe password for your account has been successfully updated."
          };

          await transporter.sendMail(mailOptions);

          flash = "You have successfully updated your password.";
          cta = "login";
        }
        catch(e) {
          const msg = e.message ? e.message : "Error while attempting to reset password.";
          const errorRes = server.methods.catch(e, msg, request.path);
          error = errorRes;
        }
        finally {
          return { error, flash, cta };
        }
      }
    });


    /**
     * Login
     * NOTE: After a user successfully logs in, they will be redirected to a different page
     * depending on how they navigated to the login form.
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
        let cta = null;
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
            flash = "The email or password that you provided does not match our records. Please register.";
            throw new Error(flash);
          }

          // If the user has not verified their email address, then set "flash" to an error message
          // and throw an error.
          if (!existingUser.records[0]._fields[0].properties.isVerified) {
            flash = "You have not verified your email address. Click the link below to send a new verification email.";
            cta = "resendVerification";
            throw new Error(flash);
          }

          // Otherwise set the user's new sessionId in the database.
          const newSessionId = `${uuid}-${currentTime}`;

          const userAccount = await session.run(
            `MATCH (u:User {
              email: { emailParam }
            })
            SET u.sessionId = { sessionIdParam }
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
          return { error, flash, cta, user };
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
            SET u.scope = { scopeParam }
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
