import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Category as CategoryType,
  CategoryFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Category = {
  type: CategoryType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("client_categories")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allCategories = {
  type: new GraphQLList(CategoryType),
  args: { ...paginationArgs, filter: { type: CategoryFilter } },
  resolve: (
    _,
    {
      perPage = 20,
      page = 0,
      sortField = "merchant_id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("client_categories")
      .where({ ...filter })
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

const _allCategoriesMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: CategoryFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("client_categories")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { Category, allCategories, _allCategoriesMeta };
