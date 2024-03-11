import yup from "yup";
import { SMS_SERVICE_STATUSES } from "@local/constants/index.js";
import { validatePresence } from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test(
      "present",
      "sms_service_not_found",
      validatePresence("sms_services", "id")
    ),
  status: yup
    .string()
    .required()
    .test("status", "unknown_status", (value) =>
      Object.keys(SMS_SERVICE_STATUSES).includes(value)
    ),
});
