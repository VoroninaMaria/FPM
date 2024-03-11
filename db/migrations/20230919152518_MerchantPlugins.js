export const up = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.json("plugins").notNull().defaultTo({ designEditor: false });
  });

export const down = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("plugins");
  });
