import yup from "yup";
import {
  validateUniqueness,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { BRAND_STATUSES } from "@local/constants/index.js";

export default yup.object({
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("name", "already_exist", validateUniqueness("brands", "name")),
  default_config: yup.object().notRequired(),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(BRAND_STATUSES).includes(value)
    ),
});
