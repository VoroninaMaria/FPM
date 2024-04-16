import { encryptPassword } from "@local/app/helpers/index.js";
import { SMS_SERVICE_STATUSES } from "@local/app/constants/index.js";
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

  const services = {
    gym1: [
      {
        service_name: "turboSms",
        config: {
          key: "141e321c61ca8118fb30399fa8f504ca74c9b56d",
          sender: "TAXI",
        },
        status: SMS_SERVICE_STATUSES.active.name,
      },
    ],
  };

  await Promise.all(
    Object.keys(services).map(async (name) => {
      const merchant = await knex("merchants").where({ name }).first();

      return Promise.all(
        services[name].map((service) =>
          knex("sms_services")
            .where({
              service_name: service.service_name,
              merchant_id: merchant?.id || null,
            })
            .then((sms_service) => {
              if (!sms_service.length)
                return knex("sms_services").insert({
                  ...service,
                  merchant_id: merchant?.id,
                });
            })
        )
      );
    })
  );
};
