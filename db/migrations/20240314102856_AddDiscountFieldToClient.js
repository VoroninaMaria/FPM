export const up = async (knex) => {
  await knex.schema.alterTable("clients", (table) => {
    table.uuid("discount_id").index().references("id").inTable("discounts");
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("clients", (table) => {
    table.dropColumn("discount_id");
  });
};
