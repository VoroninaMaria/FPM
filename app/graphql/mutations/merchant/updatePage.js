import { Database } from "@local/lib/index.js";
import { Page } from "@local/graphql/types/index.js";
import { updatePageValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Page,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    design_id: { type: new GraphQLNonNull(GraphQLID) },
    styles: { type: new GraphQLNonNull(GraphQLJSONObject) },
  },
  resolve: (_, params, { merchant }) =>
    updatePageValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("pages")
          .where({ id: params.id })
          .update(params)
          .returning("*")
          .then(([page]) => page)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
