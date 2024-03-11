import { Database } from "@local/lib/index.js";
import { Category } from "@local/graphql/types/index.js";
import { createCategoryValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";

export default {
  type: Category,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    createCategoryValidation.validate({ ...params }).then(() =>
      Database("client_categories")
        .insert({
          ...params,
        })
        .returning("*")
        .then(([category]) => category)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
