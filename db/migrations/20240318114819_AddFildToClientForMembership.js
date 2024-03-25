export const up = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.uuid("membership_id").references("id").inTable("memberships");
  });

export const down = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.dropColumn("membership_id");
  });
