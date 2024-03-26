import yup from "yup";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput),
  price: yup.number().required(),
  start_date: yup.date(),
  end_date: yup.date(),
  location_id: yup
    .string()
    .required()
    .test("present", "location_not_found", validatePresence("locations", "id")),
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
});
