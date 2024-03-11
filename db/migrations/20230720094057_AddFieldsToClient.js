export const up = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.string("first_name");
    table.string("last_name");
  });

export const down = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.dropColumn("first_name");
    table.dropColumn("last_name");
  });
