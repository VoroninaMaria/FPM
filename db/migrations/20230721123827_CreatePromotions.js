import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("promotions", (table) => {
    addPrimaryUuid(knex, table);
    table.string("title").notNull();
    table.text("text").notNull();
    table.uuid("file_id").notNull().references("id").inTable("files");
    table.uuid("merchant_id").notNull().references("id").inTable("merchants");
    addTimestamps(knex, table);
  });

  await knex.schema.createTable("client_promotions", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("client_id").notNull().references("id").inTable("clients");
    table.uuid("promotion_id").notNull().references("id").inTable("promotions");
    table.unique(["client_id", "promotion_id"]);
    table.integer("status").notNull();
    addTimestamps(knex, table);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("promotions");
  await knex.schema.dropTable("client_promotions");
};
