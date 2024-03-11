import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validatePresenceWithFields,
} from "@local/graphql/validations/shared/index.js";

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
          if (merchant.plugins.designEditor) {
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
      "design_not_found",
      validatePresenceWithFields("designs", ["id", "merchant_id"])
    ),
});
