import { addTimestamps } from "../shared/index.js";
export const up = (knex) =>
  knex.schema.createTable("client_tags", (table) => {
    table.increments();
    table.uuid("client_id").references("id").inTable("clients");
    table.uuid("tag_id").references("id").inTable("tags");
    addTimestamps(knex, table);
  });

export const down = (knex) => knex.schema.dropTable("client_tags");
