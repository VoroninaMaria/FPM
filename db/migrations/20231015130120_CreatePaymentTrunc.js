import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = (knex) =>
  knex.schema.createTable("payment_truncs", (table) => {
    addPrimaryUuid(knex, table);
    table
      .uuid("merchant_payment_gateway_id")
      .notNull()
      .references("id")
      .inTable("merchant_payment_gateways");
    table.uuid("client_id").notNull().references("id").inTable("clients");
    table.string("status");
    table.string("description");
    table.string("short_description");
    table.integer("amount");
    table.string("title");
    table.json("transactions").notNull().defaultTo("[]");

    addTimestamps(knex, table);
  });

export const down = (knex) => knex.schema.dropTable("payment_truncs");
