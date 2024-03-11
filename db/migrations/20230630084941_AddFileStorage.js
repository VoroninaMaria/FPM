import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = (knex) =>
  knex.schema.createTable("files", (table) => {
    addPrimaryUuid(knex, table);
    table.enu("account_type", ["admins", "clients", "merchants"]).notNull();
    table.uuid("account_id").notNull();
    table.index(["account_type", "account_id"]);
    table.string("mimetype").notNull();
    table.string("name");
    table.binary("data").notNull();
    addTimestamps(knex, table);
    table.unique(["name", "account_type", "account_id"]);
  });

export const down = (knex) => knex.schema.dropTable("files");
