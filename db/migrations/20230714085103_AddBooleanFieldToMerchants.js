export const up = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.boolean("newbie").notNull().defaultTo(true);
  });

export const down = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("newbie");
  });
