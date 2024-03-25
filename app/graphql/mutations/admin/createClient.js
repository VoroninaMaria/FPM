import { Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { createClientValidation } from "@local/graphql/validations/admin/index.js";
import { CLIENT_STATUSES } from "@local/app/constants/index.js";
import { encryptPassword } from "@local/helpers/index.js";

import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLError,
  GraphQLID,
  GraphQLList,
} from "graphql";

export default {
  type: Client,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
    membership_id: { type: GraphQLID },
    category_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    createClientValidation.validate(args, { strict: true }).then(async () =>
      Database("clients")
        .insert({
          merchant_id: args.merchant_id,
          first_name: args.first_name,
          last_name: args.last_name,
          email: args.email,
          phone: args.phone,
          membership_id: args.membership_id,
          ...(args.category_id && {
            category_id: args.category_id,
          }),
          encrypted_password: await encryptPassword(args.password),
          status: CLIENT_STATUSES.confirmed.name,
        })
        .returning("*")
        .then(async ([client]) => {
          if (args.tag_ids?.length > 0) {
            await Database("client_tags")
              .insert(
                args.tag_ids.map((tag_id) => ({
                  tag_id,
                  client_id: client.id,
                }))
              )
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });
          }

          return client;
        })
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
