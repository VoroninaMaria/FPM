export const up = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.uuid("design_id").references("id").inTable("designs");
  });

export const down = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("design_id");
  });
