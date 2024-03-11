import { GraphQLID, GraphQLNonNull, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Merchant as MerchantType,
  MerchantFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Merchant = {
  type: MerchantType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("merchants")
      .where({ id })
      .first()
      .then(({ plugins, ...merchant }) => {
        if (plugins.datex) {
          const filteredPlugins = Object.fromEntries(
            Object.entries(plugins).filter(
              ([key, datex]) => key && datex === true
            )
          );

          return {
            plugins: filteredPlugins,
            ...merchant,
          };
        }
        return { plugins, ...merchant };
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allMerchants = {
  type: new GraphQLList(MerchantType),
  args: { ...paginationArgs, filter: { type: MerchantFilter } },
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
    Database("merchants")
      .where(filter)
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .then((merchants) => {
        return merchants.map(({ plugins, ...merchant }) => {
          const filteredPlugins = Object.fromEntries(
            Object.entries(plugins).filter(
              ([key, value]) => key && value === true
            )
          );

          return {
            plugins: filteredPlugins,
            ...merchant,
          };
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allMerchantsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: MerchantFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("merchants")
      .where(filter)
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

export default { allMerchants, _allMerchantsMeta, Merchant };
