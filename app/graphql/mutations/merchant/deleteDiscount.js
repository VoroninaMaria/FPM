import { Database } from "@local/lib/index.js";
import { Discount } from "@local/graphql/types/index.js";
import { deleteDiscountValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Discount,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    deleteDiscountValidation.validate({ ...params }).then(() =>
      Database("discounts")
        .where({
          ...params,
        })
        .del()
        .returning("*")
        .then(([discount]) => discount)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
