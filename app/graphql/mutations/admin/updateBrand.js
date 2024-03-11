import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import { AdminBrand } from "@local/graphql/types/index.js";
import { updateBrandValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: AdminBrand,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    default_config: { type: GraphQLJSONObject },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    updateBrandValidation.validate({ ...args }).then(() =>
      Database("brands")
        .where({
          id: args.id,
        })
        .update({
          name: args.name,
          status: args.status,
          default_config: args.default_config,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([brandMerchant]) => brandMerchant)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
