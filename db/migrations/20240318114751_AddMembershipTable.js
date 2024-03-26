import { addPrimaryUuid, addTimestamps } from "../shared/index.js";
import { MEMBERSHIP_STATUSES } from "../../app/constants/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("memberships", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNull();
    table.float("price").notNull();
    table.uuid("merchant_id").notNull().references("id").inTable("merchants");
    table.uuid("location_id").references("id").inTable("locations");
    table.timestamp("start_date");
    table.timestamp("end_date");
    table.integer("term").notNull();
    table
      .string("status")
      .notNull()
      .defaultTo(MEMBERSHIP_STATUSES.inactive.name);
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("memberships");
};
