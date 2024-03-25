import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { createMembershipValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLError,
  GraphQLFloat,
} from "graphql";
import { GraphQLID } from "graphql/index.js";
import GraphQLDateTime from "graphql-type-datetime";

export default {
  type: Membership,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
    start_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_date: { type: new GraphQLNonNull(GraphQLDateTime) },
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
