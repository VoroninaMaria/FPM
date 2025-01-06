import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = (knex) => {
  return knex.schema.createTable("categories", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name");
    table.uuid("merchant_id").index().references("id").inTable("merchants");
    table.uuid("category_id").index();
    table.unique(["merchant_id", "name"]);
    addTimestamps(knex, table);
  });
};
export const down = (knex) => knex.schema.dropTable("categories");
