import yup from "yup";
import { Database } from "@local/lib/index.js";
import SmsConnectors from "@local/connectors/sms/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { SMS_SERVICE_STATUSES } from "@local/constants/index.js";

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
          if (merchant.plugins.smsServices) {
            return true;
          }
          return false;
        });
    }),
  service_name: yup
    .string()
    .required()
    .test("service_name", "unknown_service_name", (value) =>
      Object.keys(SmsConnectors).includes(value)
    ),
  config: yup
    .object({
      key: yup
        .string()
        .required()
        .test("valid", "invalid_syntax", validateTextInput),
      sender: yup
        .string()
        .required()
        .test("valid", "invalid_syntax", validateTextInput),
    })
    .required(),
  status: yup
    .string()
    .required()
    .test("status", "unknown_status", (value) =>
      Object.keys(SMS_SERVICE_STATUSES).includes(value)
    ),
});
