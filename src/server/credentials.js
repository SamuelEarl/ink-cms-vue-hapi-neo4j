module.exports = {
  dbOptsProd: {
    // Using app and Neo4j installed in Docker Compose:
    // The IP address in the URL (172.28.1.2) is the one that is configured in the `docker-compose.prod.yml` file.
    uri: "bolt://172.28.1.2",
    user: "neo4j",
    password: "bitnami"

    // Using Graphene
    // uri: "THIS NEEDS PRODUCTION DATABASE THAT IS DIFFERENT FROM THE DEVELOPMENT DATABASE",
    // user: "",
    // password: ""
  },

  dbOptsDev: {
    // Using app and Neo4j installed in Docker Compose:
    // The IP address in the URL (172.28.1.2) is the one that is configured in the `docker-compose.dev.yml` file.
    uri: "bolt://172.28.1.2",
    user: "neo4j",
    password: "bitnami"

    // Using Graphene
    // uri: "DEV-URI",
    // user: "",
    // password: ""
  }
};
