import { Database } from "@local/lib/index.js";
import { Discount } from "@local/graphql/types/index.js";
import { updateDiscountValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLFloat,
} from "graphql";

export default {
  type: Discount,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    percent: { type: new GraphQLNonNull(GraphQLFloat) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params) =>
    updateDiscountValidation.validate({ ...params }).then(() =>
      Database("discounts")
        .where({
          id: params.id,
        })
        .update({
          name: params.name,
          percent: params.percent,
          merchant_id: params.merchant_id,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([discount]) => discount)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
