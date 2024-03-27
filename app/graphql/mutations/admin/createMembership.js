import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { createMembershipValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLInt,
} from "graphql";
import { GraphQLFloat } from "graphql/index.js";

export default {
  type: Membership,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    term: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, args) =>
    createMembershipValidation.validate({ ...args }).then(() =>
      Database("memberships")
        .insert({
          ...args,
        })
        .returning("*")
        .then(([membership]) => membership)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
