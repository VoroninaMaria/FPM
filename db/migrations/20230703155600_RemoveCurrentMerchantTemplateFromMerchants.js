export const up = (knex) =>
  knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("current_merchant_template_name");
  });

export const down = (knex) =>
  knex.schema.alterTable("merchants", (table) =>
    table.string("current_merchant_template_name")
  );
