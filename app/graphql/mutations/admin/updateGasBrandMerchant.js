import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
  GraphQLList,
} from "graphql";
import { GasBrandMerchant } from "@local/graphql/types/index.js";
import { updateGasBrandMerchantValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: GasBrandMerchant,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    gas_brand_id: { type: new GraphQLNonNull(GraphQLID) },
    fuels: { type: new GraphQLList(GraphQLJSONObject) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    updateGasBrandMerchantValidation
      .validate(args, { strict: true })
      .then(() => {
        return Database("gas_brand_merchants")
          .where({
            id: args.id,
            merchant_id: args.merchant_id,
            gas_brand_id: args.gas_brand_id,
          })
          .update({
            status: args.status,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(async ([gas_brand_merchant]) => {
            if (args.fuels?.length > 0) {
              await Promise.all(
                args.fuels.map(
                  ({ id, name, regular_price, discount_price, status }) => {
                    if (id) {
                      return Database("gbm_fuels")
                        .where({
                          id,
                          gas_brand_merchant_id: gas_brand_merchant.id,
                        })
                        .update({
                          name,
                          regular_price,
                          discount_price,
                          status,
                        })
                        .catch((e) => {
                          throw new GraphQLError(e.message);
                        });
                    } else {
                      return Database("gbm_fuels")
                        .insert({
                          gas_brand_merchant_id: gas_brand_merchant.id,
                          name,
                          regular_price,
                          discount_price,
                          status,
                        })
                        .catch((e) => {
                          throw new GraphQLError(e.message);
                        });
                    }
                  }
                )
              );

              return { ...gas_brand_merchant, fuels: args.fuels ?? [] };
            }
            return gas_brand_merchant;
          })
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });
      }),
};
