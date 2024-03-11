import { addTimestamps, addPrimaryUuid } from "../shared/index.js";
import { GAS_BRAND_MERCHANT_STATUSES } from "@local/constants/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("gbm_fuels", (table) => {
    addPrimaryUuid(knex, table);
    table
      .uuid("gas_brand_merchant_id")
      .notNull()
      .references("id")
      .inTable("gas_brand_merchants");
    table.string("name").notNull();
    table.integer("regular_price").notNull();
    table.integer("discount_price").notNull();
    table.string("status").defaultTo(GAS_BRAND_MERCHANT_STATUSES.active.name);

    addTimestamps(knex, table);
    table.unique(["gas_brand_merchant_id", "name"]);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("gbm_fuels");
};
