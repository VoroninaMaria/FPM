import { Database } from "@local/lib/index.js";
import { Block } from "@local/graphql/types/index.js";
import { deleteBlockValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Block,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    deleteBlockValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("blocks")
          .where({
            id: params.id,
          })
          .del()
          .returning("*")
          .then(([block]) => block)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
