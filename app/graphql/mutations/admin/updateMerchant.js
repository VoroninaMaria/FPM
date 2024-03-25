import { Database } from "@local/lib/index.js";
import { Merchant } from "@local/graphql/types/index.js";
import { updateMerchantValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLError,
  GraphQLInt,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Merchant,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    storage_capacity: { type: new GraphQLNonNull(GraphQLInt) },
    design_id: { type: GraphQLID },
    plugins: { type: new GraphQLNonNull(GraphQLJSONObject) },
  },
  resolve: (_, args) => {
    return updateMerchantValidation
      .validate(args, { strict: true })
      .then(() => {
        return Database("merchants")
          .where({
            id: args.id,
          })
          .update({
            status: args.status,
            storage_capacity: args.storage_capacity,
            design_id: args.design_id,
            updated_at: Database.fn.now(),
            plugins: args.plugins,
          })
          .returning("*")
          .then(([merchant]) => merchant)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });
      });
  },
};
