export const up = (knex) =>
  knex.schema
    .alterTable("clients", (table) => {
      table
        .uuid("category_id")
        .index()
        .references("id")
        .inTable("client_categories");
    })
    .then(() =>
      knex.schema.alterTable("merchants", (table) => {
        table
          .uuid("default_group_id")
          .references("id")
          .inTable("client_categories");
      })
    );

export const down = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.dropColumn("category_id");
  });
