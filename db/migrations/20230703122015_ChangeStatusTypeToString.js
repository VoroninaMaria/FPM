import {
  SMS_SERVICE_STATUSES,
  BRAND_STATUSES,
  BRAND_MERCHANT_STATUSES,
} from "@local/app/constants/index.js";

export const up = async (knex) => {
  await knex.schema.alterTable("sms_services", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("brands", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("brand_merchants", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("sms_services", (table) => {
    table
      .string("status")
      .notNull()
      .defaultTo(SMS_SERVICE_STATUSES.active.name);
  });

  await knex.schema.alterTable("brands", (table) => {
    table.string("status").notNull().defaultTo(BRAND_STATUSES.active.name);
  });

  await knex.schema.alterTable("brand_merchants", (table) => {
    table
      .string("status")
      .notNull()
      .defaultTo(BRAND_MERCHANT_STATUSES.active.name);
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("sms_services", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("brands", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("brand_merchants", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.alterTable("sms_services", (table) => {
    table.enu("status", ["active", "blocked", "disabled", "error"]).notNull();
  });

  await knex.schema.alterTable("brands", (table) => {
    table.enu("status", ["active", "blocked", "disabled", "error"]).notNull();
  });

  await knex.schema.alterTable("brand_merchants", (table) => {
    table.enu("status", ["active", "disabled"]).notNull();
  });
};
