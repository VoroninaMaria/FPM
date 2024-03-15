import yup from "yup";
import { Database } from "@local/lib/index.js";
import { validatePresence } from "@local/graphql/validations/shared/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "discount", validatePresence("discounts", "id"))
    .test("empty", "delete_error", (discount_id) =>
      Database("clients")
        .where({ discount_id })
        .first()
        .then((client) => !client)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
});
