import { Database } from "@local/lib/index.js";
import { Discount } from "@local/graphql/types/index.js";
import { createDiscountValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";
import { GraphQLFloat } from "graphql/index.js";

export default {
  type: Discount,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    percent: { type: new GraphQLNonNull(GraphQLFloat) },
  },
  resolve: (_, params, { merchant }) =>
    createDiscountValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("discounts")
          .insert({
            ...params,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([discount]) => discount)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
