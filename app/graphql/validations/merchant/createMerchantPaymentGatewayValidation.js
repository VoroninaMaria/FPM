import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validateUniquenessWithFields,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { PAYMENT_GATEWAY_STATUSES } from "@local/app/constants/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id"))
    .test("active", "plugin_inactive", function (merchant_id) {
      return Database("merchants")
        .where({
          id: merchant_id,
        })
        .then(([merchant]) => {
          if (merchant.plugins.merchantPaymentGateways) {
            return true;
          }
          return false;
        });
    }),
  payment_gateway_id: yup
    .string()
    .required()
    .test(
      "present",
      "payment_gateway_not_found",
      validatePresence("payment_gateways", "id")
    )
    .test("active", "is_not_avilable", function (payment_gateway_id) {
      return Database("payment_gateways")
        .where({
          id: payment_gateway_id,
        })
        .then(([payment_gateway]) => {
          if (payment_gateway.status !== PAYMENT_GATEWAY_STATUSES.active.name) {
            return false;
          }
          return true;
        });
    }),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessWithFields("merchant_payment_gateways", [
        "name",
        "merchant_id",
      ])
    ),
  config: yup.object().notRequired(),
  status: yup
    .string()
    .required()
    .test("status", "unknown_status", (value) =>
      Object.keys(PAYMENT_GATEWAY_STATUSES).includes(value)
    ),
});
