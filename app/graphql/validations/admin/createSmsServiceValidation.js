import yup from "yup";
import SmsConnectors from "@local/connectors/sms/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { SMS_SERVICE_STATUSES } from "@local/constants/index.js";

export default yup.object({
  service_name: yup
    .string()
    .required()
    .test("service_name", `unknown_service_name`, (value) =>
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
  merchant_id: yup.string().when({
    is: (exists) => !!exists,
    then: (rule) =>
      rule.test(
        "present",
        "merchant_not_found",
        validatePresence("merchants", "id")
      ),
  }),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(SMS_SERVICE_STATUSES).includes(value)
    ),
});
