export const up = async (knex) => {
  await knex.schema.alterTable("contacts", (table) => {
    table.dropColumn("confirmed");
  });
  await knex.schema.alterTable("account_contacts", (table) => {
    table.bool("confirmed").notNull().defaultTo(false);
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("account_contacts", (table) => {
    table.dropColumn("confirmed");
  });
  await knex.schema.alterTable("contacts", (table) => {
    table.bool("confirmed").notNull().defaultTo(false);
  });
};
