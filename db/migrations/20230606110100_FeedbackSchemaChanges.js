export const up = async (knex) => {
  await knex.schema.alterTable("brands", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("brand_merchants", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("brands", (table) => {
    table.dropColumn("brand_name");
    table.string("name").notNull().unique();
    table
      .enu("status", ["active", "blocked", "disabled", "error"])
      .notNull()
      .defaultTo("active");
  });

  await knex.schema.alterTable("brand_merchants", (table) => {
    table.uuid("merchant_id").references("id").inTable("merchants").alter();
    table
      .enu("status", ["active", "blocked", "disabled", "error"])
      .notNull()
      .defaultTo("active");
    table.dropIndex("merchant_id", "merchant_id_idx");
    table.dropIndex("brand_id", "brand_id_idx");
    table.unique(["brand_id", "merchant_id"], {
      indexName: "brand_id_merchant_id_idx",
    });
  });

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
