import { GraphQLID, GraphQLNonNull, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  MerchantBrand as BrandType,
  BrandFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";
import { BRAND_STATUSES } from "@local/constants/index.js";

const Brand = {
  type: BrandType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("brands")
      .where({ id, status: BRAND_STATUSES.active.name })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allBrands = {
  type: new GraphQLList(BrandType),
  args: { ...paginationArgs, filter: { type: BrandFilter } },
  resolve: (
    _,
    {
      perPage = 4,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("brands")
      .where({ ...filter, status: BRAND_STATUSES.active.name })
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

const _allBrandsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: BrandFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("brands")
      .where({ ...filter, status: BRAND_STATUSES.active.name })
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

export default { Brand, allBrands, _allBrandsMeta };
