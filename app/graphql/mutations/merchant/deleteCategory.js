import { Database } from "@local/lib/index.js";
import { Category } from "@local/graphql/types/index.js";
import { deleteCategoryValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Category,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    deleteCategoryValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("categories")
          .where({
            id: params.id,
            merchant_id: merchant.id,
          })
          .del()
          .returning("*")
          .then(([category]) => category)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
