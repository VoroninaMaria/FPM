import { Database } from "@local/lib/index.js";
import { Merchant } from "@local/graphql/types/index.js";
import { createMerchantValidation } from "@local/graphql/validations/admin/index.js";
import { encryptPassword } from "@local/helpers/index.js";

import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";

export default {
  type: Merchant,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    login: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    createMerchantValidation.validate(args, { strict: true }).then(async () =>
      Database("merchants")
        .insert({
          name: args.name,
          login: args.login,
          encrypted_password: await encryptPassword(args.password),
          status: args.status,
        })
        .returning("*")
        .then(([merchant]) => merchant)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
