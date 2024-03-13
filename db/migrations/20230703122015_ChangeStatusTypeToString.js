import { SMS_SERVICE_STATUSES } from "@local/app/constants/index.js";

export const up = async (knex) => {
  await knex.schema.alterTable("sms_services", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("sms_services", (table) => {
    table
      .string("status")
      .notNull()
      .defaultTo(SMS_SERVICE_STATUSES.active.name);
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("sms_services", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("sms_services", (table) => {
    table.enu("status", ["active", "blocked", "disabled", "error"]).notNull();
  });
};
