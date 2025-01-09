import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { validatePresence } from "@local/graphql/validations/shared/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  id: yup
    .string()
    .required()
    .test("present", "tag_not_found", function (id) {
      const { merchant_id } = this.parent;

      return Database("tags")
        .where({ id, merchant_id })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});
