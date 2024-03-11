export const up = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.integer("id_clients");
  });

export const down = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.dropColumn("id_clients");
  });
