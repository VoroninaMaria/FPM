import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validatePresenceWithFields,
} from "@local/graphql/validations/shared/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
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
          if (merchant.plugins.categoriesEditor) {
            return true;
          }
          return false;
        });
    }),
  id: yup
    .string()
    .required()
    .test(
      "present",
      "category_not_found",
      validatePresenceWithFields("client_categories", ["id", "merchant_id"])
    )
    .test("empty", "delete_error", (category_id) =>
      Database("clients")
        .where({ category_id })
        .first()
        .then((client) => !client)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
});
