import { Database } from "@local/lib/index.js";
import { AdminBrand } from "@local/graphql/types/index.js";
import { createBrandValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLError, GraphQLString } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: AdminBrand,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    default_config: { type: GraphQLJSONObject },
  },
  resolve: (_, args) =>
    createBrandValidation.validate({ ...args }).then(() =>
      Database("brands")
        .insert({
          ...args,
        })
        .returning("*")
        .then(([brand]) => brand)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
