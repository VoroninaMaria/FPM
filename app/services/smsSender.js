import smsConnectors from "@local/connectors/sms/index.js";
import { Database } from "@local/lib/index.js";
import {
  MERCHANT_STATUSES,
  SMS_SERVICE_STATUSES,
  CLIENT_STATUSES,
} from "@local/constants/index.js";

const smsSender = async ({ phone, code, merchant_id }) => {
  if (!phone?.length) throw new Error("Phone is required");
  if (!code?.length) throw new Error("Code is required");
  if (!merchant_id?.length) throw new Error("Merchant id is required");

  const [client] = await Database("clients").where({
    phone,
    merchant_id,
  });

  if (!client) throw new Error("Client not found in database");
  if (
    ![CLIENT_STATUSES.initial.name, CLIENT_STATUSES.confirmed.name].includes(
      client.status
    )
  )
    throw new Error(`Client is in status ${client.status}`);

  const [{ sms_fallback }] = await Database("merchants")
    .select("sms_fallback")
    .where({
      id: merchant_id,
      status: MERCHANT_STATUSES.active.name,
    });

  let merchantServices = await Database("sms_services").where({
    merchant_id,
    status: SMS_SERVICE_STATUSES.active.name,
  });

  if (merchantServices.length === 0) {
    if (!sms_fallback)
      throw new Error(
        `Merchant with id ${merchant_id} doesn't have any active smsServices`
      );

    merchantServices = await Database("sms_services").where({
      merchant_id: null,
      status: SMS_SERVICE_STATUSES.active.name,
    });

    if (merchantServices.length === 0) {
      throw new Error("No available smsServices found");
    }
  }

  const {
    service_name,
    config,
    id: sms_service_id,
  } = merchantServices[Math.floor(Math.random() * merchantServices.length)];

  const message = `Your code is ${code}`;
  let response = null;

  try {
    const { status, statusText, headers, data } = await smsConnectors[
      service_name
    ].sendSms(phone, message, config);

    response = { status, statusText, headers, data };
  } catch (error) {
    const { status, statusText, headers, data } = error.response;

    response = { status, statusText, headers, data };
  }

  return Database("notification_logs")
    .insert({
      account_id: client.id,
      account_type: "clients",
      sms_service_id,
      code,
      message,
      response,
    })
    .returning("*");
};

export default smsSender;
