import { Database } from "@local/lib/index.js";
import { BrandMerchant } from "@local/graphql/types/index.js";
import { createBrandMerchantValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: BrandMerchant,
  args: {
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    brand_id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    config: { type: GraphQLJSONObject },
  },
  resolve: (_, args) =>
    createBrandMerchantValidation.validate({ ...args }).then(() =>
      Database("brand_merchants")
        .insert({
          ...args,
        })
        .returning("*")
        .then(([brandMerchant]) => brandMerchant)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
