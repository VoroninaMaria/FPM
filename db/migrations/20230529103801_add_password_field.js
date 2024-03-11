export const up = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.string("password");
  });

export const down = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.dropColumn("password");
  });
