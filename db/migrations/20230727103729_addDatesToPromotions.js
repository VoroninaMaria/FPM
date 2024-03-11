export const up = (knex) =>
  knex.schema.alterTable("promotions", (table) => {
    table.timestamp("start_date").notNull();
    table.timestamp("end_date").notNull();
  });

export const down = (knex) =>
  knex.schema.alterTable("promotions", (table) => {
    table.dropColumn("start_date");
    table.dropColumn("end_date");
  });
