import { Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { createClientValidation } from "@local/graphql/validations/merchant/index.js";
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
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
    category_id: { type: GraphQLID },
    membership_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { merchant }) =>
    createClientValidation
      .validate({ ...params, merchant_id: merchant.id }, { strict: true })
      .then(async () =>
        Database("clients")
          .insert({
            first_name: params.first_name,
            last_name: params.last_name,
            email: params.email,
            phone: params.phone,
            ...(params.category_id && { category_id: params.category_id }),
            merchant_id: merchant.id,
            membership_id: params.membership_id,
            encrypted_password: await encryptPassword(params.password),
            status: CLIENT_STATUSES.confirmed.name,
          })
          .returning("*")
          .then(async ([client]) => {
            if (params.tag_ids?.length > 0) {
              await Database("client_tags")
                .insert(
                  params.tag_ids.map((tag_id) => ({
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
