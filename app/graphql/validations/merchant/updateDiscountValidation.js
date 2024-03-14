import yup from "yup";
import {
  validatePresence,
  validatePresenceWithFields,
  validateTextInput,
  validateUniquenessOnUpdateWithFields,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "discount_not_found", validatePresence("merchants", "id")),
  id: yup
    .string()
    .required()
    .test(
      "present",
      "discount_not_found",
      validatePresenceWithFields("discounts", ["id", "merchant_id"])
    ),
  percent: yup.number().required(),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessOnUpdateWithFields("discounts", ["name", "merchant_id"])
    ),
});
