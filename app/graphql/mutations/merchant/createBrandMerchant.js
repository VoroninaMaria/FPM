import { Database } from "@local/lib/index.js";
import { BrandMerchant } from "@local/graphql/types/index.js";
import { createBrandMerchantValidation } from "@local/graphql/validations/merchant/index.js";
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
    brand_id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    config: { type: GraphQLJSONObject },
  },
  resolve: (_, args, { merchant }) =>
    createBrandMerchantValidation
      .validate({ ...args, merchant_id: merchant.id })
      .then(() =>
        Database("brand_merchants")
          .insert({
            ...args,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([brandMerchant]) => brandMerchant)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
