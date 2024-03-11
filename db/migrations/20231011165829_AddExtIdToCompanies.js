export const up = (knex) =>
  knex.schema.alterTable("companies", (table) => {
    table.string("external_id");
    table.uuid("brand_merchant_id");
    table.unique(["external_id", "brand_merchant_id"]);
  });

export const down = (knex) =>
  knex.schema.alterTable("companies", (table) => {
    table.dropColumn("external_id");
    table.dropColumn("brand_merchant_id");
  });
