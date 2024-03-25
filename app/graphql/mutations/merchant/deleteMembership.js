import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { deleteMembershipValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Membership,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    deleteMembershipValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("memberships")
          .where({
            ...params,
          })
          .del()
          .returning("*")
          .then(([membership]) => membership)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
