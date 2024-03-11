import yup from "yup";
import { GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { isPasswordValid } from "@local/helpers/index.js";
import { validatePresence } from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "client_not_found", validatePresence("clients", "id")),
  old_password: yup
    .string()
    .required()
    .min(4)
    .max(8)
    .test("password_matches", "old_password_invalid", function (old_password) {
      if (!old_password) return true;
      const { id } = this.parent;

      return Database("clients")
        .where({ id })
        .then(async ([client]) => {
          const isValid = await isPasswordValid(
            old_password,
            client.encrypted_password
          );

          return isValid;
        })
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  new_password: yup.string().required().min(4).max(8),
});
