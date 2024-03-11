import { GraphQLList, GraphQLID, GraphQLError, GraphQLNonNull } from "graphql";

import { Database } from "@local/lib/index.js";
import {
  GasBrandMerchantFilter,
  GasBrandMerchant as GasBrandMerchantType,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const GasBrandMerchant = {
  type: GasBrandMerchantType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("gas_brand_merchants")
      .where({ id })
      .first()
      .then(async (gas_brand_merchant) => {
        gas_brand_merchant.fuels = await Database("gbm_fuels")
          .select(["id", "name", "regular_price", "discount_price", "status"])
          .where({
            gas_brand_merchant_id: gas_brand_merchant.id,
          });

        return gas_brand_merchant;
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
    }
  ) =>
    Database("gas_brand_merchants")
      .where({
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
      .then((gas_brand_merchants) => {
        return gas_brand_merchants.map(async (gas_brand_merchant) => {
          gas_brand_merchant.fuels = await Database("gbm_fuels")
            .select(["id", "name", "regular_price", "discount_price", "status"])
            .where({
              gas_brand_merchant_id: gas_brand_merchant.id,
            });

          return gas_brand_merchant;
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allGasBrandMerchantsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: GasBrandMerchantFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("gas_brand_merchants")
      .where({
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
