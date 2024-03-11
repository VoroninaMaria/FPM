import Config from "@local/app/lib/Config.js";

const knexConfig = {
  client: "pg",
  migrations: {
    tableName: "migrations",
    directory: "./db/migrations",
    stub: "./db/stubs/migration.stub",
  },
  seeds: {
    directory: "./db/seeds",
    stub: "./db/stubs/seed.stub",
  },
  ...Config.database,
  debug: process.env.DEBUG,
};

export default knexConfig;
