import { Database } from "@local/lib/index.js";
import { Category } from "@local/graphql/types/index.js";
import { createCategoryValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";

export default {
  type: Category,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { merchant }) =>
    createCategoryValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("client_categories")
          .insert({
            ...params,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([category]) => category)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
