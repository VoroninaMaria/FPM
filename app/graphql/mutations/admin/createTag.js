import { Database } from "@local/lib/index.js";
import { Tag } from "@local/graphql/types/index.js";
import { createTagValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";

export default {
  type: Tag,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    createTagValidation.validate({ ...params }).then(() =>
      Database("tags")
        .insert({
          ...params,
        })
        .returning("*")
        .then(([tag]) => tag)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
