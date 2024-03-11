import Config from "./Config.js";
import knex from "knex";

const Database = knex({
  // debug: Config.env === "development",
  ...Config.database,
});

export default Database;
