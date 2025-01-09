export const up = async (knex) => {
  await knex.schema.createTable("notification_logs", (table) => {
    table
      .uuid("id", { primaryKey: true, useBinaryUuid: true })
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("contact_id").notNull();
    table.text("message").notNull();
    table.json("response").notNull();
    table.timestamp("created_at").notNull().defaultTo(knex.raw("now()"));
    table.timestamp("updated_at").notNull().defaultTo(knex.raw("now()"));
    table.index("contact_id", "notification_logs_contact_id_idx");
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("notification_logs");
};
