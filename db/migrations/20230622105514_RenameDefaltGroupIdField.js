export const up = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("default_group_id");
    table
      .uuid("default_category_id")
      .references("id")
      .inTable("client_categories");
  });

export const down = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("default_category_id");
    table
      .uuid("default_group_id")
      .references("id")
      .inTable("client_categories");
  });
