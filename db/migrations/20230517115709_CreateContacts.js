import { addTimestamps, addPrimaryUuid } from "../shared/index.js";
export const up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "citext"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.createTable("contacts", (table) => {
    addPrimaryUuid(knex, table);
    table.bool("confirmed").notNull().defaultTo(false);
    table.enu("type", ["Phone", "Email"]).notNull().defaultTo("Phone");
    table.string("value").notNull().unique();
    addTimestamps(knex, table);
    table.index(["value", "type"], "contacts_type_value_idx");
  });

  await knex.schema.createTable("account_contacts", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("contact_id").notNull();
    table.uuid("account_id").notNull();
    table.enu("account_type", ["admins", "clients", "merchants"]).notNull();
    addTimestamps(knex, table);
    table.index(
      ["account_id", "account_type", "contact_id"],
      "acc_cont_acc_type_acc_id_cont_id_idx"
    );
  });

  await knex.schema.createTable("admins", (table) => {
    addPrimaryUuid(knex, table);
    addTimestamps(knex, table);
  });

  await knex.schema.createTable("merchants", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNull().unique();
    addTimestamps(knex, table);
  });

  await knex.schema.createTable("clients", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("merchant_id").notNull();
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("contacts");
  await knex.schema.dropTable("account_contacts");
  await knex.schema.dropTable("admins");
  await knex.schema.dropTable("merchants");
  await knex.schema.dropTable("clients");
};
