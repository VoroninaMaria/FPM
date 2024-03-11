import { Database } from "@local/lib/index.js";
import { Tag } from "@local/graphql/types/index.js";
import { updateTagValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";

export default {
  type: Tag,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { merchant }) =>
    updateTagValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("tags")
          .where({
            id: params.id,
            merchant_id: merchant.id,
          })
          .update({
            name: params.name,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([tag]) => tag)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
