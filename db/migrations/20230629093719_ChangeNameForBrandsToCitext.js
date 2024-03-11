export const up = (knex) =>
  knex.raw("alter TABLE brands ALTER COLUMN name TYPE citext");
export const down = (knex) =>
  knex.raw("alter TABLE brands ALTER COLUMN name TYPE varchar");
