import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
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
      .then(({ ...merchant }) => ({
        ...merchant,
      }))
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
      perPage = 2,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { id, ids, ...filter },
    },
    { merchant }
  ) =>
    Database("merchants")
      .where({
        id: merchant.id,
        ...(id && { id }),
        ...filter,
      })
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allMerchantsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: MerchantFilter } },
  resolve: (_, { filter: { id, ids, ...filter } }, { merchant }) =>
    Database("merchants")
      .where({
        id: merchant.id,
        ...(id && { id }),
        ...filter,
      })
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { allMerchants, _allMerchantsMeta, Merchant };
