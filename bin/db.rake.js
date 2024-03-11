import pg from "pg";
import os from "os";
import fs from "fs";
import { Config, Logger } from "@local/app/lib/index.js";

const create = async () => {
  Logger.info("Creating");

  const pgClient = new pg.Client({
    ...Config.database.connection,
    database: "template1",
  });

  Logger.warn(`Creating databases for ${Config.env}`);
  await pgClient.connect();
  await pgClient.query(
    `CREATE DATABASE ${Config.database.connection.database}`,
    (err, res) => {
      if (err) Logger.error(err.message);
      if (res)
        Logger.info(
          `PG database created ${Config.database.connection.database}`
        );
      pgClient.end();
    }
  );
};

const drop = async () => {
  Logger.warn("Dropping");

  const pgClient = new pg.Client({
    ...Config.database.connection,
    database: "template1",
  });

  Logger.warn(`Removing databases for ${Config.env}`);
  await pgClient.connect();
  await pgClient.query(
    `DROP DATABASE IF EXISTS ${Config.database.connection.database}`,
    (err, res) => {
      if (err) Logger.warn(err.message);
      if (res)
        Logger.warn(
          `PG database dropped ${Config.database.connection.database}`
        );
      pgClient.end();
    }
  );
};

const annotate = async () => {
  Logger.info("Annotating");

  const pgClient = new pg.Client(Config.database.connection);

  Logger.info(`Saving schema ${Config.env}`);
  await pgClient.connect();
  await pgClient.query(
    `SELECT data_type, table_name,  column_name, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, column_name;`,
    (err, res) => {
      pgClient.end();
      if (err) Logger.info(err.message);
      if (res) {
        const { rows } = res;
        const schema = {};

        rows.forEach(
          ({ table_name, column_name, column_default, data_type }) => {
            if (!schema[table_name]) schema[table_name] = {};
            schema[table_name][column_name] = {
              type: data_type,
              default: column_default,
            };
          }
        );

        return fs.writeFileSync(
          `./db/${Config.env}.schema.json`,
          JSON.stringify(schema, null, 2) + os.EOL
        );
      }
    }
  );
};

export { create, drop, annotate };
