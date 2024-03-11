import { addTimestamps, addPrimaryUuid } from "../shared/index.js";
import { GAS_BRAND_MERCHANT_STATUSES } from "@local/constants/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("gas_brand_merchants", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("merchant_id").notNull().references("id").inTable("merchants");
    table.uuid("gas_brand_id").notNull().references("id").inTable("gas_brands");
    table.string("status").defaultTo(GAS_BRAND_MERCHANT_STATUSES.active.name);
    addTimestamps(knex, table);
    table.unique(["merchant_id", "gas_brand_id"]);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("gas_brand_merchants");
};
