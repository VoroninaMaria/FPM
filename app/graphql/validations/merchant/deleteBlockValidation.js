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
          if (merchant.plugins.blocksEditor) {
            return true;
          }
          return false;
        });
    }),
  id: yup
    .string()
    .required()
    .test("present", "block_not_found", async function (id) {
      return Database("designs")
        .where({
          id: await Database("pages")
            .select("design_id")
            .where({
              id: await Database("blocks")
                .select("page_id")
                .where({ id })
                .first()
                .then(({ page_id }) => page_id)
                .catch(() => {
                  throw new GraphQLError("Forbidden");
                }),
            })
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
    }),
});
