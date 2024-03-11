import yup from "yup";
import {
  validatePresence,
  validateUniquenessWithFields,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  name: yup
    .string()
    .required("Name is required!")
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "name",
      "already_exist",
      validateUniquenessWithFields("companies", ["name", "merchant_id"])
    ),
  merchant_id: yup
    .string()
    .required()
    .test(
      "present",
      "companies_not_found",
      validatePresence("merchants", "id")
    ),
});
