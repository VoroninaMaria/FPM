import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Tag as TagType,
  TagFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Tag = {
  type: TagType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("tags")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allTags = {
  type: new GraphQLList(TagType),
  args: { ...paginationArgs, filter: { type: TagFilter } },
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
    Database("tags")
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

const _allTagsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: TagFilter } },
  resolve: (_, { filter: { ids, ...filter } }, { merchant }) =>
    Database("tags")
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

export default { Tag, allTags, _allTagsMeta };
