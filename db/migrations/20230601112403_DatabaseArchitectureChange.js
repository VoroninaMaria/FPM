export const up = async (knex) => {
  await knex.schema.dropTable("account_contacts");
  await knex.schema.dropTable("contacts");
  await knex.schema.dropTable("sessions");

  await knex.schema.alterTable("admins", (table) => {
    table.string("login").notNull().unique();
    table.string("encrypted_password").notNull();
  });

  await knex.schema.alterTable("merchants", (table) => {
    table.string("encrypted_password").notNull();
    table.string("status").notNull().defaultTo("active").alter();
  });

  await knex.schema.alterTable("notification_logs", (table) => {
    table.dropColumn("contact_id");
    table.dropColumn("account_type");
  });

  await knex.schema.alterTable("notification_logs", (table) => {
    table.string("code").notNull();
    table.enu("account_type", ["admins", "clients", "merchants"]).notNull();
    table.index(["account_id", "account_type"], "acc_id_acc_type_idx");
  });
};

export const down = () => {
  throw new Error("Irreversible migration");
};
