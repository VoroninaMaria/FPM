export const up = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.bool("sms_fallback").defaultTo(false);
  });

export const down = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("sms_fallback");
  });
