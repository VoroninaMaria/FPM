export const up = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.string("status").notNull().defaultTo("inactive");
  });

export const down = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("status");
  });
