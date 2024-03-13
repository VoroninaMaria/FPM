import yup from "yup";
import {
  validatePresence,
  validateUniquenessWithFields,
  validatePresenceWithFields,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  id: yup
    .string()
    .required()
    .test(
      "present",
      "category_not_found",
      validatePresenceWithFields("client_categories", ["id", "merchant_id"])
    ),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessWithFields("client_categories", ["name", "merchant_id"])
    ),
});
