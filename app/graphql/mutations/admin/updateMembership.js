import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { updateMembershipValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLFloat,
  GraphQLError,
} from "graphql";
import GraphQLDateTime from "graphql-type-datetime";

export default {
  type: Membership,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
    start_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_date: { type: new GraphQLNonNull(GraphQLDateTime) },
  },
  resolve: (_, params) =>
    updateMembershipValidation.validate({ ...params }).then(() =>
      Database("memberships")
        .where({
          id: params.id,
        })
        .update({
          ...params,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([location]) => location)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
