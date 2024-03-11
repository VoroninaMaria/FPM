import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validateTextInput,
  validateEmail,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  fn_clients: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_syntax", validateTextInput),
    }),
  phones: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_syntax", validateTextInput),
    }),
  email: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_syntax", validateEmail),
    }),
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id"))
    .test("active", "plugin_inactive", function (merchant_id) {
      return Database("merchants")
        .where({
          id: merchant_id,
        })
        .then(([merchant]) => {
          if (merchant.plugins.datex) {
            return true;
          }
          return false;
        });
    }),
});
