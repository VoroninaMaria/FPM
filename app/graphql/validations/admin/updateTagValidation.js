import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import {
  validateTextInput,
  validatePresence,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "tag_not_found", validatePresence("tags", "id")),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", async function (name) {
      return Database("tags")
        .where({
          name,
          merchant_id: await Database("tags")
            .select("merchant_id")
            .where({ id: this.parent.id })
            .first()
            .then(({ merchant_id }) => merchant_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
        })
        .first()
        .then((tag) => !tag)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});
