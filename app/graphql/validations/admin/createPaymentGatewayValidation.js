import yup from "yup";
import {
  validateUniqueness,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { PAYMENT_GATEWAY_STATUSES } from "@local/constants/index.js";

export default yup.object({
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniqueness("payment_gateways", "name")
    ),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(PAYMENT_GATEWAY_STATUSES).includes(value)
    ),
});
