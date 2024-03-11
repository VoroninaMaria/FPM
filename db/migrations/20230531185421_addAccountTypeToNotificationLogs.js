export const up = (knex) =>
  knex.schema.alterTable("notification_logs", (table) => {
    table.string("account_type").notNull();
  });

export const down = (knex) =>
  knex.schema.alterTable("notification_logs", (table) => {
    table.dropColumn("account_type");
  });
