import yup from "yup";
import { Database } from "@local/lib/index.js";
import { validatePresence } from "@local/graphql/validations/shared/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "category_not_found", validatePresence("categories", "id"))
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
