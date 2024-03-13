import { encryptPassword } from "@local/app/helpers/index.js";
import { SMS_SERVICE_STATUSES } from "@local/app/constants/index.js";
export const seed = async (knex) => {
  await knex("merchants")
    .insert([
      {
        name: "uklon",
        encrypted_password: await encryptPassword("123123"),
        login: "uklon",
      },
      {
        name: "uber",
        encrypted_password: await encryptPassword("123123"),
        login: "uber",
      },
      {
        name: "bolt",
        encrypted_password: await encryptPassword("123123"),
        login: "bolt",
      },
      {
        name: "opti",
        encrypted_password: await encryptPassword("123123"),
        login: "opti",
      },
      {
        name: "Mango",
        encrypted_password: await encryptPassword("123123"),
        login: "mango",
      },
    ])
    .onConflict("name")
    .merge();

  const services = {
    uklon: [
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
    bolt: [
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
    uber: [
      {
        service_name: "turboSms",
        config: {
          key: "e398b796f650e97128662073a43b7669c4c28826",
          sender: "TAXI",
        },
        status: SMS_SERVICE_STATUSES.active.name,
      },
      {
        service_name: "alphaSms",
        config: {
          key: "f86f4e3b8902dfa7787a59f7600c3d3013dc51d3",
          sender: "TestAccount",
        },
        status: SMS_SERVICE_STATUSES.active.name,
      },
    ],
    Mango: [
      {
        service_name: "turboSms",
        config: {
          key: "5b4125499088d6ad76f93c8b9a8d98ead14d7487",
          sender: "TAXI",
        },
        status: SMS_SERVICE_STATUSES.active.name,
      },
    ],
    other: [
      {
        service_name: "hicellSms",
        config: {
          key: "UwEA4v6sxP1ZMYCbKqKaMw2e1NmY4oGr",
          sender: "DOSTAVKA",
        },
        status: SMS_SERVICE_STATUSES.disabled.name,
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
