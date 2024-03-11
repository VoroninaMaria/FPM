export const up = (knex) =>
  knex.schema.alterTable("companies", (table) => {
    table.boolean("active").defaultTo(true);
  });

export const down = (knex) =>
  knex.schema.alterTable("companies", (table) => {
    table.dropColumn("active");
  });
