export const up = (knex) =>
  knex.schema.createTable("templates", (table) => {
    table
      .uuid("id", { primaryKey: true, useBinaryUuid: true })
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("value").notNull().unique();
    table.json("default_config").notNull().defaultTo({});
    table.boolean("default").defaultTo(false);
    table.timestamp("created_at").notNull().defaultTo(knex.raw("now()"));
    table.timestamp("updated_at").notNull().defaultTo(knex.raw("now()"));
  });

export const down = (knex) => knex.schema.dropTable("templates");
