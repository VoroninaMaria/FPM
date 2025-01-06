import { encryptPassword } from "@local/app/helpers/index.js";
export const seed = async (knex) => {
  await knex("merchants")
    .insert([
      {
        name: "gym1",
        encrypted_password: await encryptPassword("123123"),
        login: "gym1",
      },
      {
        name: "gym2",
        encrypted_password: await encryptPassword("123123"),
        login: "gym2",
      },
    ])
    .onConflict("name")
    .merge();
};
