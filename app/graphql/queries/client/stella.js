import { GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { GasBrandMerchant as GasBrandMerchantType } from "@local/graphql/types/index.js";
import {
  GAS_BRAND_STATUSES,
  GAS_BRAND_MERCHANT_STATUSES,
} from "@local/constants/index.js";

const stella = {
  type: new GraphQLList(GasBrandMerchantType),
  resolve: (_, __, { client }) =>
    Database("gas_brand_merchants")
      .where({
        merchant_id: client.merchant_id,
        status: GAS_BRAND_MERCHANT_STATUSES.active.name,
      })
      .then(async (gas_brand_merchants) => {
        const activeGasBrandsIds = (
          await Database("gas_brands")
            .where({
              status: GAS_BRAND_STATUSES.active.name,
            })
            .returning("id")
        ).map((gas_brand) => gas_brand.id);

        return gas_brand_merchants.filter((gas_brand_merchant) =>
          activeGasBrandsIds.includes(gas_brand_merchant.gas_brand_id)
        );
      })
      .then(async (gas_brand_merchants) => {
        return gas_brand_merchants.map(async (gas_brand_merchant) => {
          gas_brand_merchant.fuels = await Database("gbm_fuels")
            .select(["id", "name", "regular_price", "discount_price", "status"])
            .where({
              gas_brand_merchant_id: gas_brand_merchant.id,
              status: GAS_BRAND_MERCHANT_STATUSES.active.name,
            });
          const { name: gbName } = await Database("gas_brands")
            .where({
              id: gas_brand_merchant.gas_brand_id,
              status: GAS_BRAND_STATUSES.active.name,
            })
            .first();

          return {
            name: gbName,
            ...gas_brand_merchant,
          };
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export { stella };
