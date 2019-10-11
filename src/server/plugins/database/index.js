"use strict";

// Imports
const neo4j = require("neo4j-driver").v1;

exports.plugin = {
  pkg: require("./package.json"),
  register: async function(server, options) {

    // ============================
    // Database connection data
    // ============================
    const uri = options.uri;
    const user = options.user;
    const password = options.password;

    // This try block will connect to the database
    try {
      // Connect to the Neo4j server through the driver and save that connection to a variable called "driver".
      const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      // Create a variable called "session" that acts as a reference to the database object.
      // You will use session.run("<CYPHER QUERY>") anytime you want to run a CRUD operation against the database.
      const session = driver.session();

      // Add the session database object to the server.app namespace
      server.app.session = session;

      if (driver) {
        // const driverString = JSON.stringify(driver);
        // console.log("Neo4j Connection Info:", driverString);
        const connection = JSON.stringify(driver._address._hostPort);
        console.log(`Connected to Neo4j database on ${connection}`);
      }

      await server.logger().info(driver);
    }
    catch(e) {
      console.error("DATABASE CONNECTION ERROR:", e);
      await server.logger().error(e);
    }
  }
};
