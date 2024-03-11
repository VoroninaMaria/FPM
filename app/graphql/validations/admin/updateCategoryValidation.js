import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  id: yup
    .string()
    .required()
    .test(
      "present",
      "category_not_found",
      validatePresence("client_categories", "id")
    ),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", async function (name) {
      return Database("client_categories")
        .where({
          name,
          merchant_id: await Database("client_categories")
            .select("merchant_id")
            .where({ id: this.parent.id })
            .first()
            .then(({ merchant_id }) => merchant_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
        })
        .first()
        .then((category) => !category)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});
