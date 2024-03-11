import { Database } from "@local/lib/index.js";
import { Tag } from "@local/graphql/types/index.js";
import { deleteTagValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Tag,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    deleteTagValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("tags")
          .where({
            id: params.id,
            merchant_id: merchant.id,
          })
          .del()
          .returning("*")
          .then(([tag]) => tag)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
