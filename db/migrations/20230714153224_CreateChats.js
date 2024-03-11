import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = (knex) =>
  knex.schema.createTable("chat_messages", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("merchant_id").notNull().references("id").inTable("merchants");
    table.uuid("client_id").notNull().references("id").inTable("clients");
    table.uuid("reply_to").references("id").inTable("chat_messages");
    table.enu("author", ["merchant", "client"]).notNull();
    table.string("message");
    table.integer("status").notNull().defaultTo(0);
    addTimestamps(knex, table);
  });

export const down = (knex) => knex.schema.dropTable("chat_messages");
