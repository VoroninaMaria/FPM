import yup from "yup";
import { validatePresence } from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "page_not_found", validatePresence("pages", "id"))
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
