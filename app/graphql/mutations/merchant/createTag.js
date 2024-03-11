import { Database } from "@local/lib/index.js";
import { Tag } from "@local/graphql/types/index.js";
import { createTagValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";

export default {
  type: Tag,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { merchant }) =>
    createTagValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("tags")
          .insert({
            ...params,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([tag]) => tag)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
