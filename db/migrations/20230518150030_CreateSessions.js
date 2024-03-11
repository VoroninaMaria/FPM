export const up = (knex) =>
  knex.schema.createTable("sessions", (table) => {
    table
      .uuid("id", { primaryKey: true, useBinaryUuid: true })
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.enu("account_type", ["admins", "clients", "merchants"]).notNull();
    table.uuid("account_id").notNull();
    table
      .enu("status", ["active", "blocked", "expired"])
      .notNull()
      .defaultTo("active");
    table.timestamp("expires_at");
    table.timestamp("created_at").notNull().defaultTo(knex.raw("now()"));
    table.timestamp("updated_at").notNull().defaultTo(knex.raw("now()"));
    table.index(["account_type", "account_id"], "session_owner_idx");
  });

export const down = (knex) => knex.schema.dropTable("sessions");
