// Update with your config settings.
require("dotenv").config();
const fs = require("fs");
const path = require("node:path");
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: process.env.DEV_DATABASE_URL,
  },

  staging: {
    client: "postgresql",
    connection: process.env.STAGING_DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      connectionString: process.env.PRODUCTION_DATABASE_URL,
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, "./ca-certificate.crt")), //needed for SSL in some database providers
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
