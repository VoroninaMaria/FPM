import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { validatePresence } from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "tag_not_found", validatePresence("tags", "id"))
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
