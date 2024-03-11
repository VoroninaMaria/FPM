import { GraphQLList, GraphQLID, GraphQLError, GraphQLNonNull } from "graphql";

import { Database } from "@local/lib/index.js";
import {
  GasBrandMerchantFilter,
  GasBrandMerchant as GasBrandMerchantType,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";
import { GAS_BRAND_STATUSES } from "@local/constants/index.js";

const GasBrandMerchant = {
  type: GasBrandMerchantType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { merchant }) =>
    Database("gas_brand_merchants")
      .where({
        id,
        merchant_id: merchant.id,
      })
      .first()
      .then(async (gas_brand_merchant) => {
        gas_brand_merchant.fuels = await Database("gbm_fuels")
          .select(["id", "name", "regular_price", "discount_price", "status"])
          .where({
            gas_brand_merchant_id: gas_brand_merchant.id,
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
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allGasBrandMerchants = {
  type: new GraphQLList(GasBrandMerchantType),
  args: { ...paginationArgs, filter: { type: GasBrandMerchantFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    },
    { merchant }
  ) =>
    Database("gas_brand_merchants")
      .where({
        merchant_id: merchant.id,
        ...filter,
      })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
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

const _allGasBrandMerchantsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: GasBrandMerchantFilter } },
  resolve: (_, { filter: { ids, ...filter } }, { merchant }) =>
    Database("gas_brand_merchants")
      .where({
        merchant_id: merchant.id,
        ...filter,
      })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default {
  allGasBrandMerchants,
  _allGasBrandMerchantsMeta,
  GasBrandMerchant,
};
