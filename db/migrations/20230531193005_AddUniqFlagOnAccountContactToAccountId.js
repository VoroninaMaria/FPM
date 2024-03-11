export const up = (knex) =>
  knex.schema.alterTable("account_contacts", (table) => {
    table.unique(["account_id", "account_type"]);
  });

export const down = (knex) =>
  knex.schema.alterTable("account_contacts", (table) => {
    table.dropUnique(["account_id", "account_type"]);
  });
