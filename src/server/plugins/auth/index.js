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

  }
};
