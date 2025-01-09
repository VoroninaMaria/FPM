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
    .test("present", "file_not_found", function (id) {
      const { merchant_id: account_id } = this.parent;

      return Database("files")
        .where({ id, account_id, account_type: "merchants" })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden1111");
        });
    }),
});
