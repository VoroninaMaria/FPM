import yup from "yup";
import { GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { isPasswordValid } from "@local/helpers/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "admin_not_found", validatePresence("admins", "id")),
  current_password: yup
    .string()
    .required()
    .min(4, "min_length")
    .max(64)
    .test("valid", "invalid_syntax", validateTextInput)
    .test("password_matches", "not_match", function (password) {
      if (!password) return true;
      const { id } = this.parent;

      return Database("admins")
        .where({ id })
        .first()
        .then(({ encrypted_password }) =>
          isPasswordValid(password, encrypted_password)
        )
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  new_password: yup
    .string()
    .required()
    .min(4, "min_length")
    .max(64)
    .test("valid", "invalid_syntax", validateTextInput),
});
