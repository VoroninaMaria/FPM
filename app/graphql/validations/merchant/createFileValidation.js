import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  account_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id"))
    .test("active", "plugin_inactive", function (account_id) {
      return Database("merchants")
        .where({
          id: account_id,
        })
        .then(([merchant]) => {
          if (merchant.plugins.files) {
            return true;
          }
          return false;
        });
    }),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", function (name) {
      const { account_id } = this.parent;

      return Database("files")
        .where({ name, account_id })
        .first()
        .then((name) => !name)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  data: yup.string().required(),
});
