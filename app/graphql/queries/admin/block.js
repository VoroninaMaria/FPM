import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Block as BlockType,
  BlockFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Block = {
  type: BlockType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("blocks")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allBlocks = {
  type: new GraphQLList(BlockType),
  args: { ...paginationArgs, filter: { type: BlockFilter } },
  resolve: (
    _,
    {
      perBlock = 20,
      Block = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("blocks")
      .where(filter)
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .limit(perBlock)
      .offset(Block * perBlock)
      .orderBy(sortField, sortOrder)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allBlocksMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: BlockFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("blocks")
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

export default { Block, allBlocks, _allBlocksMeta };
