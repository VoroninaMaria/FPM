import { Database } from "@local/lib/index.js";
import { Design } from "@local/graphql/types/index.js";
import { createDesignValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Design,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    styles: { type: new GraphQLNonNull(GraphQLJSONObject) },
  },
  resolve: (_, params, { merchant }) =>
    createDesignValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("designs")
          .insert({
            ...params,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([design]) => design)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
