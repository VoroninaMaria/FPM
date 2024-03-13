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
    })
    .test("empty", "delete_error", (tag_id) =>
      Database("client_tags")
        .where({ tag_id })
        .first()
        .then((client_tag) => !client_tag)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
});
