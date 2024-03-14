import { Database } from "@local/lib/index.js";
import { Discount } from "@local/graphql/types/index.js";
import { createDiscountValidation } from "@local/graphql/validations/admin/index.js";
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
    name: { type: new GraphQLNonNull(GraphQLString) },
    percent: { type: new GraphQLNonNull(GraphQLFloat) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    createDiscountValidation.validate({ ...params }).then(() =>
      Database("discounts")
        .insert({
          ...params,
        })
        .returning("*")
        .then(([discount]) => discount)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
