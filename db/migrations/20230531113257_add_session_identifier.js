export const up = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.string("session_identifier");
  });

export const down = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.dropColumn("session_identifier");
  });
