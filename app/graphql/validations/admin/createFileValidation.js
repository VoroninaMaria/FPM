import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { validateTextInput } from "@local/graphql/validations/shared/index.js";

export default yup.object({
  account_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", function (account_id) {
      return Database(this.parent.account_type)
        .where({ id: account_id })
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
      const { account_id, account_type } = this.parent;

      return Database("files")
        .where({ name, account_id, account_type })
        .first()
        .then((name) => !name)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  data: yup.string().required(),
});
