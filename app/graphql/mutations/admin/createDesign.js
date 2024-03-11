import { Database } from "@local/lib/index.js";
import { Design } from "@local/graphql/types/index.js";
import { createDesignValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Design,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    styles: { type: new GraphQLNonNull(GraphQLJSONObject) },
  },
  resolve: (_, params) =>
    createDesignValidation.validate(params).then(() =>
      Database("designs")
        .insert(params)
        .returning("*")
        .then(([design]) => design)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
