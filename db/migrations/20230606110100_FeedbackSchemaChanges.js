export const up = async (knex) => {
  await knex.schema.alterTable("clients", (table) => {
    table.uuid("merchant_id").notNull().alter();
  });

  await knex.schema.alterTable("sms_services", (table) => {
    table.uuid("merchant_id").references("id").inTable("merchants").alter();
  });
};

export const down = () => {
  throw new Error("Irreversible migration");
};
