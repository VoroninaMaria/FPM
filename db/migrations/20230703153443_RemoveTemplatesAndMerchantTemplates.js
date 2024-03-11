export const up = (knex) =>
  knex.schema
    .dropTable("merchant_templates")
    .then(() => knex.schema.dropTable("templates"));

export const down = (knex) =>
  knex.schema
    .createTable("templates", (table) => {
      table
        .uuid("id", { primaryKey: true, useBinaryUuid: true })
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.string("value").notNull().unique();
      table.json("default_config").notNull().defaultTo({});
      table.boolean("default").defaultTo(false);
      table.timestamp("created_at").notNull().defaultTo(knex.raw("now()"));
      table.timestamp("updated_at").notNull().defaultTo(knex.raw("now()"));
    })
    .then(() =>
      knex.schema.createTable("merchant_templates", (table) => {
        table.increments();
        table
          .uuid("merchant_id")
          .references("id")
          .inTable("merchants")
          .notNull()
          .index();
        table
          .uuid("template_id")
          .references("id")
          .inTable("templates")
          .notNull()
          .index();
        table.string("name").notNull().unique();
        table.json("config").notNull().defaultTo({});
        table.timestamp("created_at").notNull().defaultTo(knex.raw("now()"));
        table.timestamp("updated_at").notNull().defaultTo(knex.raw("now()"));
      })
    );
