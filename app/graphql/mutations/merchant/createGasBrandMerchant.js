import { Database } from "@local/lib/index.js";
import { GasBrandMerchant } from "@local/graphql/types/index.js";
import { createGasBrandMerchantValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";

export default {
  type: GasBrandMerchant,
  args: {
    gas_brand_id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args, { merchant }) =>
    createGasBrandMerchantValidation
      .validate({ ...args, merchant_id: merchant.id })
      .then(() => {
        return Database("gas_brand_merchants")
          .insert({
            merchant_id: merchant.id,
            gas_brand_id: args.gas_brand_id,
            status: args.status,
          })
          .returning("*")
          .then(([GasBrandMerchant]) => GasBrandMerchant)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });
      }),
};
