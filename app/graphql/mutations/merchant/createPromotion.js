import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { Promotion } from "@local/graphql/types/index.js";
import { createPromotionValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLID } from "graphql";
import GraphQLDateTime from "graphql-type-datetime";

export default {
  type: Promotion,
  args: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: new GraphQLNonNull(GraphQLString) },
    file_id: { type: new GraphQLNonNull(GraphQLID) },
    start_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_date: { type: new GraphQLNonNull(GraphQLDateTime) },
  },
  resolve: (_, args, { merchant }) =>
    createPromotionValidation
      .validate({ ...args, merchant_id: merchant.id })
      .then(() =>
        Database("promotions")
          .insert({ ...args, merchant_id: merchant.id })
          .returning("*")
          .then(([promotion]) => promotion)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
