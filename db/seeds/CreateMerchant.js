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
        service_name: "flySms",
        config: {
          key: "JaME7O57E6fTzh3zJcNgOBEtrgASM98d",
          sender: "InfoCenter",
        },
        status: SMS_SERVICE_STATUSES.active.name,
      },
      {
        service_name: "smsClub",
        config: { key: "VfdhzEAwOp4kMO2", sender: "Shop Zakaz" },
        status: SMS_SERVICE_STATUSES.active.name,
      },
    ],
    gym2: [
      {
        service_name: "hicellSms",
        config: {
          key: "9212efb2306359181a14c02ba54f23d433ba34e9",
          sender: "DOSTAVKA",
        },
        status: SMS_SERVICE_STATUSES.active.name,
      },
      {
        service_name: "flySms",
        config: {
          key: "JaME7O57E6fTzh3zJcNgOBEtrgASM98d",
          sender: "InfoCenter",
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
