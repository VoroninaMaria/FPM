import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("merchant_payment_gateways", (table) => {
    addPrimaryUuid(knex, table);
    table.string("name").notNullable();
    table.boolean("default").defaultTo(false);
    table.uuid("merchant_id").notNull().references("id").inTable("merchants");
    table.string("status").notNullable().defaultTo("active");
    table
      .uuid("payment_gateway_id")
      .notNull()
      .references("id")
      .inTable("payment_gateways");
    addTimestamps(knex, table);
    table.json("config").notNull().default({});
    table.unique(["name", "merchant_id"]);
  });
  await knex.schema.raw(
    `CREATE UNIQUE INDEX "idx_merchant_gateways_default" ON "merchant_payment_gateways" ("merchant_id", "default") WHERE "default" is true`
  );
};

export const down = (knex) =>
  knex.schema.dropTable("merchant_payment_gateways");
