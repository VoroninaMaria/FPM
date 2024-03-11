import { encryptPassword } from "@local/app/helpers/index.js";

export const seed = async (knex) => {
  await knex("admins")
    .insert([
      { login: "offtop", encrypted_password: await encryptPassword("123123") },
    ])
    .onConflict("login")
    .merge();
};
