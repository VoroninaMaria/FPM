import { addPrimaryUuid, addTimestamps } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("sessions", (table) => {
    addPrimaryUuid(knex, table);
    table.string("time").notNull();
    table.string("day").notNull();
    table.uuid("hall_id").index().notNull().references("id").inTable("halls");
    table.uuid("movie_id").index().notNull().references("id").inTable("movies");
    table.specificType("place_arr", "text[]").notNull();
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("sessions");
};
