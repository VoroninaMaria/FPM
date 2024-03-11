import { Logger } from "@local/lib/index.js";

const defaultError = (
  res,
  error,
  status = 406,
  error_message = null,
  logger_level = "warn"
) => {
  Logger[logger_level](error_message || error);
  res.status(status);
  res.send({ error });
};

const alreadyConfirmed = (res) => defaultError(res, "already_confirmed");

const badGateway = (res, err) =>
  defaultError(res, "bad_gateway", 502, err, "error");

const forbidden = (res) => defaultError(res, "forbidden", 403);
const blocked = (res) => defaultError(res, "blocked", 423);
const invalidLoginData = (res) => defaultError(res, "invalid_login_data", 403);
const invalidPhone = (res) => defaultError(res, "invalid_phone");
const invalidMerchant = (res) => defaultError(res, "invalid_merchant");
const missingMerchantOrPhone = (res) =>
  defaultError(res, "missing_merchant_or_phone");
const missingFirstNameOrLastName = (res) =>
  defaultError(res, "missing_first_name_or_last_name");

const registeringTooOften = (res) => defaultError(res, "registering_too_often");

export {
  alreadyConfirmed,
  badGateway,
  forbidden,
  blocked,
  invalidLoginData,
  invalidPhone,
  invalidMerchant,
  missingMerchantOrPhone,
  missingFirstNameOrLastName,
  registeringTooOften,
};
