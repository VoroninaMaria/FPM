export const up = (knex) =>
  knex.schema.alterTable("brands", (table) => {
    table.json("default_config").defaultTo({});
  });

export const down = (knex) =>
  knex.schema.alterTable("brands", (table) =>
    table.dropColumn("default_config")
  );
