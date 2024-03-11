export const addPrimaryUuid = (knex, table) => {
  table
    .uuid("id", { primaryKey: true, useBinaryUuid: true })
    .defaultTo(knex.raw("uuid_generate_v4()"));
};
export const addTimestamps = (knex, table) => {
  table.timestamp("created_at").notNull().defaultTo(knex.raw("now()"));
  table.timestamp("updated_at").notNull().defaultTo(knex.raw("now()"));
};
