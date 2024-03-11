import yup from "yup";
import { validatePresence } from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
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
          if (merchant.plugins.pageEditor) {
            return true;
          }
          return false;
        });
    }),
  id: yup
    .string()
    .required()
    .test("present", "page_not_found", async function (id) {
      return Database("designs")
        .where({
          id: await Database("pages")
            .select("design_id")
            .where({ id })
            .first()
            .then(({ design_id }) => design_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
          merchant_id: this.parent.merchant_id,
        })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    })
    .test("set_as_default", "page_set_as_default", function (id) {
      return Database("designs")
        .where({ default_page_id: id })
        .orWhere({ error_page_id: id })
        .orWhere({ authenticated_page_id: id })
        .orWhere({ loader_page_id: id })
        .first()
        .then((page) => !page)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});
