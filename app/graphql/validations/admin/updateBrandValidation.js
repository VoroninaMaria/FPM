import yup from "yup";
import { BRAND_STATUSES } from "@local/constants/index.js";
import {
  validatePresence,
  validateUniquenessOnUpdate,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "brand_not_found", validatePresence("brands", "id")),
  status: yup
    .string()
    .required()
    .test("status", "unknown_status", (value) =>
      Object.keys(BRAND_STATUSES).includes(value)
    ),
  default_config: yup.object().required(),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessOnUpdate("brands", "name")
    ),
});
