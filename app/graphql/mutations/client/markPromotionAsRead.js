import { Database } from "@local/lib/index.js";
import { Promotion } from "@local/graphql/types/index.js";
import { markPromotionAsReadValidation } from "@local/graphql/validations/client/index.js";
import { GraphQLID, GraphQLNonNull, GraphQLError } from "graphql";

export default {
  type: Promotion,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant, client }) =>
    markPromotionAsReadValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("client_promotions")
          .insert({
            promotion_id: params.id,
            client_id: client.id,
            status: 1,
          })
          .returning("*")
          .onConflict(["promotion_id", "client_id"])
          .ignore()
          .then(() =>
            Database("promotions")
              .where({
                id: params.id,
              })
              .first()
              .catch(() => {
                throw new GraphQLError("Forbidden");
              })
          )
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
