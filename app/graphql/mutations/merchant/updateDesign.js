import { Database } from "@local/lib/index.js";
import { Design } from "@local/graphql/types/index.js";
import { updateDesignValidation } from "@local/graphql/validations/merchant/index.js";
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
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    styles: { type: new GraphQLNonNull(GraphQLJSONObject) },
    default_page_id: { type: GraphQLID },
    authenticated_page_id: { type: GraphQLID },
    loader_page_id: { type: GraphQLID },
    error_page_id: { type: GraphQLID },
  },
  resolve: (_, params, { merchant }) =>
    updateDesignValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("designs")
          .where({ id: params.id })
          .update(params)
          .returning("*")
          .then(([design]) => design)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
