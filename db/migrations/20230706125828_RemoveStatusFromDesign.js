export const up = (knex) =>
  knex.schema.alterTable("designs", (table) => {
    table.dropColumn("status");
  });

export const down = (knex) =>
  knex.schema.alterTable("designs", (table) => {
    table.string("status");
  });
