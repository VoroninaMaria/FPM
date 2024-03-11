import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("name", "already_exist", function (name) {
      const { merchant_id } = this.parent;

      return Database("tags")
        .where({ name, merchant_id })
        .first()
        .then((tag) => !tag)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  merchant_id: yup
    .string()
    .required()
    .test("present", "category_not_found", validatePresence("merchants", "id")),
});
