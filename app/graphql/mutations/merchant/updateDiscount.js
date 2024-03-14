import { Database } from "@local/lib/index.js";
import { Discount } from "@local/graphql/types/index.js";
import { updateDiscountValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";
import { GraphQLFloat } from "graphql/index.js";

export default {
  type: Discount,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    percent: { type: new GraphQLNonNull(GraphQLFloat) },
  },
  resolve: (_, params, { merchant }) =>
    updateDiscountValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("discounts")
          .where({
            id: params.id,
            merchant_id: merchant.id,
          })
          .update({
            name: params.name,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([discount]) => discount)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
