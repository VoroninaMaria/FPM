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
    .test("valid", "invalid_syntax", validateTextInput),
  address: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "address",
      "already_exist",
      validateUniquenessWithFields("locations", ["address", "merchant_id"])
    ),
  merchant_id: yup
    .string()
    .required()
    .test("present", "location_not_found", validatePresence("merchants", "id")),
});
