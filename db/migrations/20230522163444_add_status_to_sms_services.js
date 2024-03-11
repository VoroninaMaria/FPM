export const up = (knex) =>
  knex.schema.alterTable("sms_services", (table) => {
    table
      .enu("status", ["active", "blocked", "disabled", "error"])
      .notNull()
      .defaultTo("active");
  });

export const down = (knex) =>
  knex.schema.alterTable("sms_services", (table) => {
    table.dropColumn("status");
  });
