import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Design as DesignType,
  DesignFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Design = {
  type: DesignType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("designs")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allDesigns = {
  type: new GraphQLList(DesignType),
  args: { ...paginationArgs, filter: { type: DesignFilter } },
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
    Database("designs")
      .where({ merchant_id: merchant.id, ...filter })
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

const _allDesignsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: DesignFilter } },
  resolve: (_, { filter: { ids, ...filter } }, { merchant }) =>
    Database("designs")
      .where({ merchant_id: merchant.id, ...filter })
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

export default { Design, allDesigns, _allDesignsMeta };
