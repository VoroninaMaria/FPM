import yup from "yup";
import { Database } from "@local/lib/index.js";
import { SMS_SERVICE_STATUSES } from "@local/constants/index.js";
import {
  validatePresence,
  validatePresenceWithFields,
} from "@local/graphql/validations/shared/index.js";

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
  id: yup
    .string()
    .required()
    .test(
      "present",
      "sms_service_not_found",
      validatePresenceWithFields("sms_services", ["id", "merchant_id"])
    ),
  status: yup
    .string()
    .required()
    .test("status", `unknown_status`, (value) =>
      Object.keys(SMS_SERVICE_STATUSES).includes(value)
    ),
});
