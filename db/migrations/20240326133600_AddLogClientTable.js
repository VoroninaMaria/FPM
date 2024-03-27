import { addPrimaryUuid, addTimestamps } from "../shared/index.js";
import { MEMBERSHIP_STATUSES } from "../../app/constants/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("membership_log", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("client_id").notNull().references("id").inTable("clients");
    table.uuid("membership_id").references("id").inTable("memberships");
    table.timestamp("start_date");
    table.timestamp("end_date");
    table
      .string("status")
      .notNull()
      .defaultTo(MEMBERSHIP_STATUSES.inactive.name);
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("membership_log");
};
