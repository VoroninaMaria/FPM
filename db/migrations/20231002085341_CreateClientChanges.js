import { addTimestamps } from "../shared/index.js";
import { CLIENT_CHANGE_STATUSES } from "@local/constants/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("client_changes", (table) => {
    table.increments("id");
    table.uuid("client_id").notNull().references("id").inTable("clients");
    table.string("field_name");
    table.string("value");
    table.string("status").defaultTo(CLIENT_CHANGE_STATUSES.pending.name);
    addTimestamps(knex, table);
    table.unique(["client_id", "value"]);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("client_changes");
};
