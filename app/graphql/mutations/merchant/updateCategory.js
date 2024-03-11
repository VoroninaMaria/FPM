import { Database } from "@local/lib/index.js";
import { Category } from "@local/graphql/types/index.js";
import { updateCategoryValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";

export default {
  type: Category,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { merchant }) =>
    updateCategoryValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("client_categories")
          .where({
            id: params.id,
            merchant_id: merchant.id,
          })
          .update({
            name: params.name,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([category]) => category)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
