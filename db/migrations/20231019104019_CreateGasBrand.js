import { addTimestamps, addPrimaryUuid } from "../shared/index.js";
import { GAS_BRAND_STATUSES } from "@local/constants/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("gas_brands", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNull().unique();
    table.uuid("logo_file_id").notNull().references("id").inTable("files");
    table.string("status").defaultTo(GAS_BRAND_STATUSES.active.name);
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("gas_brands");
};
