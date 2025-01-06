export const up = async (knex) => {
  await knex.schema.alterTable("admins", (table) => {
    table.string("session_identifier");
  });

  await knex.schema.alterTable("merchants", (table) => {
    table.string("session_identifier");
    table.string("login").notNull().unique();
  });
};

export const down = (knex) => {
  knex.schema.alterTable("admins", (table) => {
    table.dropColumn("session_identifier");
  });

  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("session_identifier");
    table.dropColumn("login");
  });
};
