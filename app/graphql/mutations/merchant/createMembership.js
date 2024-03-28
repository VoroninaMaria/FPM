import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { createMembershipValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLError,
  GraphQLFloat,
} from "graphql";
import { GraphQLID, GraphQLInt } from "graphql/index.js";

export default {
  type: Membership,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    term: { type: new GraphQLNonNull(GraphQLInt) },
    file_id: { type: GraphQLID },
    status: { type: new GraphQLNonNull(GraphQLString) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    createMembershipValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("memberships")
          .insert({
            ...params,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([membership]) => membership)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
