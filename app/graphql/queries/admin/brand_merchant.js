import { GraphQLList, GraphQLID, GraphQLError, GraphQLNonNull } from "graphql";

import { Database } from "@local/lib/index.js";
import {
  BrandMerchantFilter,
  BrandMerchant as BrandMerchantType,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const BrandMerchant = {
  type: BrandMerchantType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("brand_merchants")
      .where({
        "brand_merchants.id": id,
      })
      .first()
      .then(({ config, ...bm }) => ({
        config,
        ...bm,
      }))
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allBrandMerchants = {
  type: new GraphQLList(BrandMerchantType),
  args: { ...paginationArgs, filter: { type: BrandMerchantFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { id, ids, ...filter },
    }
  ) =>
    Database("brand_merchants")
      .where({
        ...(id && { "brand_merchants.id": id }),
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
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allBrandMerchantsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: BrandMerchantFilter } },
  resolve: (_, { filter: { id, ids, ...filter } }) =>
    Database("brand_merchants")
      .where({
        ...(id && { "brand_merchants.id": id }),
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
  allBrandMerchants,
  _allBrandMerchantsMeta,
  BrandMerchant,
};
