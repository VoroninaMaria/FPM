import { CLIENT_STATUSES } from "@local/app/constants/index.js";

export const up = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.string("status").notNull().defaultTo(CLIENT_STATUSES.initial.name);
    table.dropColumn("confirmed");
  });

export const down = (knex) =>
  knex.schema.alterTable("clients", (table) => {
    table.dropColumn("status");
    table.boolean("confirmed").defaultTo(false);
  });
