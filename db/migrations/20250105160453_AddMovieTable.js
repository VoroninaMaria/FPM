import { addPrimaryUuid, addTimestamps } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("movies", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNull();
    table.string("description").notNull();
    table.string("start_date").notNull();
    table.string("age").notNull();
    table.string("duration").notNull();
    table.string("main_roles").notNull();
    table.uuid("file_id").references("id").inTable("files");
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("movies");
};
