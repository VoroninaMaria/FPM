import { Database } from "@local/lib/index.js";
import { Tag } from "@local/graphql/types/index.js";
import { deleteTagValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Tag,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    deleteTagValidation.validate({ ...params }).then(() =>
      Database("tags")
        .where({
          id: params.id,
        })
        .del()
        .returning("*")
        .then(([tag]) => tag)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
