import { GraphQLID, GraphQLNonNull, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  GasBrand as GasBrandType,
  GasBrandFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";
import { GAS_BRAND_MERCHANT_STATUSES } from "@local/constants/index.js";

const GasBrand = {
  type: GasBrandType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("gas_brands")
      .where({ id, status: GAS_BRAND_MERCHANT_STATUSES.active.name })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allGasBrands = {
  type: new GraphQLList(GasBrandType),
  args: { ...paginationArgs, filter: { type: GasBrandFilter } },
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
    Database("gas_brands")
      .where({ ...filter, status: GAS_BRAND_MERCHANT_STATUSES.active.name })
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

const _allGasBrandsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: GasBrandFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("gas_brands")
      .where({ ...filter, status: GAS_BRAND_MERCHANT_STATUSES.active.name })
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

export default { GasBrand, allGasBrands, _allGasBrandsMeta };
