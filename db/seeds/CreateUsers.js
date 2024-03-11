import { encryptPassword } from "@local/app/helpers/index.js";
import {
  MERCHANT_STATUSES,
  CLIENT_STATUSES,
} from "@local/app/constants/index.js";

export const seed = async (knex) => {
  const merchants = await knex("merchants").where({
    status: MERCHANT_STATUSES.active.name,
  });

  const [mango] = await knex("merchants").where({
    name: "Mango",
  });

  await Promise.all(
    merchants.map(async (merchant) => {
      await knex("clients")
        .insert([
          {
            merchant_id: merchant.id,
            phone: "380630000000",
            encrypted_password: await encryptPassword("123123"),
            status: CLIENT_STATUSES.confirmed.name,
          },
          {
            merchant_id: merchant.id,
            phone: "380630000001",
            encrypted_password: await encryptPassword("123123"),
            status: CLIENT_STATUSES.confirmed.name,
          },
          {
            merchant_id: mango.id,
            phone: "380684949999",
            first_name: "Катерина Григорівна",
            last_name: "Оприско",
            encrypted_password: await encryptPassword("123123"),
            status: CLIENT_STATUSES.confirmed.name,
          },
        ])
        .onConflict()
        .ignore();
    })
  );
};
