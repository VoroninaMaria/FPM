import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Discount as CategoryType,
  DiscountFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Discount = {
  type: CategoryType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { merchant }) =>
    Database("discounts")
      .where({ id, merchant_id: merchant.id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allDiscounts = {
  type: new GraphQLList(CategoryType),
  args: { ...paginationArgs, filter: { type: DiscountFilter } },
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
    Database("discounts")
      .where({ merchant_id: merchant.id, ...filter })
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

const _allDiscountsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: DiscountFilter } },
  resolve: (_, { filter: { ids, ...filter } }, { merchant }) =>
    Database("discounts")
      .where({ merchant_id: merchant.id, ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { Discount, allDiscounts, _allDiscountsMeta };
