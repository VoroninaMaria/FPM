export const up = async (knex) => {
  await knex.schema.alterTable("merchants", (table) => {
    table.integer("storage_capacity").notNull().defaultTo(1000);
  });

  await knex.schema.alterTable("files", (table) => {
    table.integer("size").notNull().defaultTo(0);
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("storage_capacity");
  });

  await knex.schema.alterTable("files", (table) => {
    table.dropColumn("size");
  });
};
