export const up = (knex) =>
  knex.schema.alterTable("sms_services", (table) => {
    table.float("balance");
  });

export const down = (knex) =>
  knex.schema.alterTable("sms_services", (table) =>
    table.dropColumn("balance")
  );
