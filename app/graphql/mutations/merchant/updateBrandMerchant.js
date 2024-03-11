import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import { BrandMerchant } from "@local/graphql/types/index.js";
import { updateBrandMerchantValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: BrandMerchant,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    brand_id: { type: new GraphQLNonNull(GraphQLID) },
    config: { type: GraphQLJSONObject },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args, { merchant }) =>
    updateBrandMerchantValidation
      .validate({ ...args, merchant_id: merchant.id }, { strict: true })
      .then(() =>
        Database("brand_merchants")
          .where({
            id: args.id,
            merchant_id: merchant.id,
          })
          .update({
            status: args.status,
            config: args.config,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([brandMerchant]) => brandMerchant)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
