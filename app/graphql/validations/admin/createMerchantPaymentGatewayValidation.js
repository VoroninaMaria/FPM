import yup from "yup";
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
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  payment_gateway_id: yup
    .string()
    .required()
    .test(
      "present",
      "payment_gateway_not_found",
      validatePresence("payment_gateways", "id")
    ),
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
