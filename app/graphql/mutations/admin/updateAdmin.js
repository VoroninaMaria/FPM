import { Database } from "@local/lib/index.js";
import { Admin } from "@local/graphql/types/index.js";
import { updateAdminValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";
import {
  encryptPassword,
  generateSessionIdentifier,
} from "@local/helpers/index.js";

export default {
  type: Admin,
  args: {
    current_password: { type: new GraphQLNonNull(GraphQLString) },
    new_password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args, context) =>
    updateAdminValidation
      .validate({ ...args, id: context.admin.id })
      .then(async () =>
        Database("admins")
          .where({
            id: context.admin.id,
          })
          .update({
            encrypted_password: await encryptPassword(args.new_password),
            session_identifier: generateSessionIdentifier(),
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([admin]) => admin)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
