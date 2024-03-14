import yup from "yup";
import { GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

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
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", function (name) {
      const { merchant_id } = this.parent;

      return Database("tags")
        .where({ name, merchant_id })
        .first()
        .then((tag) => !tag)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});
