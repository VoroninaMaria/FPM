import { GraphQLList, GraphQLID, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  TruncFilter,
  Trunc as TruncType,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Trunc = {
  type: TruncType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("payment_truncs")
      .where({ id })
      .then(([trunc]) => trunc)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allTruncs = {
  type: new GraphQLList(TruncType),
  args: { ...paginationArgs, filter: { type: TruncFilter } },
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
    Database("payment_truncs")
      .where(filter)
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

const _allTruncsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: TruncFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("payment_truncs")
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

export default {
  allTruncs,
  _allTruncsMeta,
  Trunc,
};
