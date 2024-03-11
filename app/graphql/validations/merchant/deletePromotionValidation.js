import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { validatePresence } from "@local/graphql/validations/shared/index.js";

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
          if (merchant.plugins.notifications) {
            return true;
          }
          return false;
        });
    }),
  id: yup
    .string()
    .required()
    .test("present", "promotion_not_found", function (id) {
      const { merchant_id } = this.parent;

      return Database("promotions")
        .where({ id, merchant_id })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});
