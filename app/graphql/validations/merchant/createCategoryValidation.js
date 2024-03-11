import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validateUniquenessWithFields,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessWithFields("client_categories", ["name", "merchant_id"])
    ),
  merchant_id: yup
    .string()
    .required()
    .test("present", "category_not_found", validatePresence("merchants", "id"))
    .test("active", "plugin_inactive", function (merchant_id) {
      return Database("merchants")
        .where({
          id: merchant_id,
        })
        .then(([merchant]) => {
          if (merchant.plugins.categoriesEditor) {
            return true;
          }
          return false;
        });
    }),
});
