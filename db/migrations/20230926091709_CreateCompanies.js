import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("companies", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("merchant_id").notNull().references("id").inTable("merchants");
    table.string("name").notNull();
    table.unique(["name", "merchant_id"]);
    addTimestamps(knex, table);
  });

  await knex.schema.createTable("managers", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("company_id").notNull().references("id").inTable("companies");
    table.uuid("client_id").notNull().references("id").inTable("clients");
    addTimestamps(knex, table);
    table.unique(["company_id", "client_id"]);
  });

  await knex.schema.alterTable("clients", (table) => {
    table.uuid("company_id").references("id").inTable("companies");
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("clients", (table) => {
    table.dropColumn("company_id");
  });
  await knex.schema.dropTable("companies");
  await knex.schema.dropTable("managers");
};
