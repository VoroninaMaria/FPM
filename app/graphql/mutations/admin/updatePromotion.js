import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import { Promotion } from "@local/graphql/types/index.js";
import { updatePromotionValidation } from "@local/graphql/validations/admin/index.js";
import GraphQLDateTime from "graphql-type-datetime";
export default {
  type: Promotion,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    file_id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: new GraphQLNonNull(GraphQLString) },
    start_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_date: { type: new GraphQLNonNull(GraphQLDateTime) },
  },
  resolve: (_, params) =>
    updatePromotionValidation.validate(params).then(() =>
      Database("promotions")
        .where({
          id: params.id,
        })
        .update({
          title: params.title,
          text: params.text,
          file_id: params.file_id,
          start_date: params.start_date,
          end_date: params.end_date,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([promotion]) => promotion)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
