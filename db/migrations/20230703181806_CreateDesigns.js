import { addTimestamps, addPrimaryUuid } from "../shared/index.js";

export const up = async (knex) => {
  await knex.schema.createTable("designs", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("merchant_id").notNull().references("id").inTable("merchants");
    table.string("name").notNull();
    table.json("styles").notNull().default({});

    table.string("status");
    table.unique(["name", "merchant_id"]);
    addTimestamps(knex, table);
  });

  await knex.schema.createTable("pages", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("design_id").notNull().references("id").inTable("designs");
    table.string("name").notNull();
    table.json("styles").notNull().default({});
    addTimestamps(knex, table);
    table.unique(["name", "design_id"]);
  });

  await knex.schema.createTable("blocks", (table) => {
    addPrimaryUuid(knex, table);
    table.uuid("page_id").notNull().references("id").inTable("pages");
    table.string("type");
    table.integer("blocks").default(0);
    table.json("container_styles").notNull().default({});
    table.json("props").notNull().default({});
    table.json("styles").notNull().default({});
    table.integer("position").default(0);
    addTimestamps(knex, table);
  });
  await knex.schema.alterTable("designs", (table) => {
    table.uuid("default_page_id").references("id").inTable("pages");
    table.uuid("error_page_id").references("id").inTable("pages");
    table.uuid("loader_page_id").references("id").inTable("pages");
    table.uuid("authenticated_page_id").references("id").inTable("pages");
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("designs", (table) => {
    table.dropColumn("default_page_id");
    table.dropColumn("authenticated_page_id");
    table.dropColumn("error_page_id");
    table.dropColumn("loader_page_id");
  });
  await knex.schema.dropTable("blocks");
  await knex.schema.dropTable("pages");
  await knex.schema.dropTable("designs");
};
