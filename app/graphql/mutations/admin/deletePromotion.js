import { Database } from "@local/lib/index.js";
import { Promotion } from "@local/graphql/types/index.js";
import { deletePromotionValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Promotion,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    deletePromotionValidation.validate(params).then(() =>
      Database("client_promotions")
        .where({
          promotion_id: params.id,
        })
        .del()
        .then(() =>
          Database("promotions")
            .where({
              id: params.id,
            })
            .del()
            .returning("*")
            .then(([promotion]) => promotion)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            })
        )
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
