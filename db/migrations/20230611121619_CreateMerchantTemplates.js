export const up = (knex) =>
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
  });

export const down = (knex) => knex.schema.dropTable("merchant_templates");
