export const up = (knex) =>
  knex.schema.alterTable("notification_logs", (table) => {
    table.uuid("account_id");
    table.index("account_id", "notification_logs_account_id_idx");
  });

export const down = (knex) =>
  knex.schema.alterTable("notification_logs", (table) => {
    table.dropColumn("account_id");
  });
