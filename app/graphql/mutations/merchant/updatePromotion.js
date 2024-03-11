import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import GraphQLDateTime from "graphql-type-datetime";
import { Promotion } from "@local/graphql/types/index.js";
import { updatePromotionValidation } from "@local/graphql/validations/merchant/index.js";

export default {
  type: Promotion,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    file_id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    text: { type: new GraphQLNonNull(GraphQLString) },
    start_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_date: { type: new GraphQLNonNull(GraphQLDateTime) },
  },
  resolve: (
    _,
    { id, title, text, file_id, start_date, end_date },
    { merchant }
  ) =>
    updatePromotionValidation
      .validate({
        id,
        title,
        text,
        file_id,
        start_date,
        end_date,
        merchant_id: merchant.id,
      })
      .then(() =>
        Database("promotions")
          .where({ id })
          .update({
            title,
            text,
            file_id,
            start_date,
            end_date,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([promotion]) => promotion)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
