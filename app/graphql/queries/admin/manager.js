import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Manager as ManagerType,
  ManagerFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Manager = {
  type: ManagerType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("managers")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allManagers = {
  type: new GraphQLList(ManagerType),
  args: { ...paginationArgs, filter: { type: ManagerFilter } },
  resolve: (
    _,
    {
      perPage = 20,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("managers")
      .where({ ...filter })
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

const _allManagersMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: ManagerFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("managers")
      .where({ ...filter })
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

export default { Manager, allManagers, _allManagersMeta };
