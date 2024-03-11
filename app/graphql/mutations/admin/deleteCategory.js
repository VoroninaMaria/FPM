import { Database } from "@local/lib/index.js";
import { Category } from "@local/graphql/types/index.js";
import { deleteCategoryValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Category,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    deleteCategoryValidation.validate({ ...params }).then(() =>
      Database("client_categories")
        .where({
          ...params,
        })
        .del()
        .returning("*")
        .then(([category]) => category)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
