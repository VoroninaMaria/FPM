import yup from "yup";
import {
  validatePresence,
  validateTextInput,
  validateUniquenessWithFields,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "name",
      "already_exist",
      validateUniquenessWithFields("discounts", ["name", "merchant_id"])
    ),
  percent: yup.number().required(),
  merchant_id: yup
    .string()
    .required()
    .test("present", "discount_not_found", validatePresence("merchants", "id")),
});
