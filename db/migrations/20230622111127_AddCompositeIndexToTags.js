export const up = (knex) =>
  knex.schema.alterTable("client_tags", (table) => {
    table.unique(["client_id", "tag_id"]);
  });

export const down = (knex) =>
  knex.schema.alterTable("client_tags", (table) => {
    table.dropUnique(["client_id", "tag_id"]);
  });
