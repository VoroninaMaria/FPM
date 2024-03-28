export const up = (knex) =>
  knex.schema.alterTable("memberships", (table) => {
    table.uuid("file_id").references("id").inTable("files");
  });

export const down = (knex) =>
  knex.schema.alterTable("memberships", (table) => {
    table.dropColumn("file_id");
  });
