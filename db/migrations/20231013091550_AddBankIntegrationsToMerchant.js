import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = (knex) =>
  knex.schema.createTable("payment_gateways", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNullable();
    table.string("status").notNullable().defaultTo("active");
    addTimestamps(knex, table);
    table.unique("name");
  });
export const down = (knex) => knex.schema.dropTable("payment_gateways");
