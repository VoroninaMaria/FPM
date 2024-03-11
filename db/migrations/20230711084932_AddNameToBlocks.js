export const up = (knex) =>
  knex.schema.alterTable("blocks", (table) => {
    table.string("name").notNull();
    table.unique(["name", "page_id"]);
  });

export const down = (knex) =>
  knex.schema.alterTable("blocks", (table) => {
    table.dropColumn("name");
  });
