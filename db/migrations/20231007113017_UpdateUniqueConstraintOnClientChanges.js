export const up = (knex) =>
  knex.schema.alterTable("client_changes", async (table) => {
    table.dropUnique(["client_id", "value"]);

    await knex.schema.raw(
      `CREATE UNIQUE INDEX "idx_client_id_field_name" ON "client_changes" ("client_id", "field_name") WHERE "status" = 'pending' or "status" is null`
    );
  });

export const down = (knex) =>
  knex.schema.alterTable("client_changes", async (table) => {
    await knex.schema.raw(`DROP INDEX "idx_client_id_field_name"`);
    table.unique(["client_id", "value"]);
  });
