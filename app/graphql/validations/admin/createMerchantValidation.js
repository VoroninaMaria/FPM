import yup from "yup";
import { MERCHANT_STATUSES } from "@local/constants/index.js";
import {
  validateUniqueness,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  name: yup
    .string()
    .min(4)
    .max(10)
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", validateUniqueness("merchants", "name")),
  login: yup
    .string()
    .min(4)
    .max(10)
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", validateUniqueness("merchants", "login")),
  password: yup
    .string()
    .min(4, "min_length")
    .test("valid", "invalid_syntax", validateTextInput),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(MERCHANT_STATUSES).includes(value)
    ),
});
