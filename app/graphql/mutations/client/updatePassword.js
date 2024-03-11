import { Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { updatePasswordValidation } from "@local/graphql/validations/client/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";
import {
  encryptPassword,
  generateSessionIdentifier,
} from "@local/helpers/index.js";

export default {
  type: Client,
  args: {
    old_password: { type: new GraphQLNonNull(GraphQLString) },
    new_password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args, { client }) => {
    return updatePasswordValidation
      .validate({ ...args, id: client.id })
      .then(async () =>
        Database("clients")
          .where({
            id: client.id,
          })
          .update({
            encrypted_password: await encryptPassword(args.new_password),
            session_identifier: generateSessionIdentifier(),
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([client]) => client)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      );
  },
};
