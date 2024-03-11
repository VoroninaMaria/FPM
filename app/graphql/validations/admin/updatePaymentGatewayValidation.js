import yup from "yup";
import { PAYMENT_GATEWAY_STATUSES } from "@local/constants/index.js";
import {
  validatePresence,
  validateUniquenessOnUpdate,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test(
      "present",
      "payment_gateway_not_found",
      validatePresence("payment_gateways", "id")
    ),
  status: yup
    .string()
    .required()
    .test("status", "unknown_status", (value) =>
      Object.keys(PAYMENT_GATEWAY_STATUSES).includes(value)
    ),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessOnUpdate("payment_gateways", "name")
    ),
});
