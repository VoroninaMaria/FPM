import yup from "yup";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  client_id: yup
    .string()
    .required()
    .test("present", "client_not_found", validatePresence("clients", "id")),
  amount: yup.number().integer("invalid_syntax").required(),
  description: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput),
});
