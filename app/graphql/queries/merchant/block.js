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
  resolve: async (
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
    Database("blocks")
      .where(filter)
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .whereIn(
        "page_id",
        await Database("pages")
          .select("id")
          .whereIn(
            "design_id",
            await Database("designs")
              .select("id")
              .where({ merchant_id: merchant.id })
              .then((designs) => designs.map((design) => design.id))
              .catch(() => {
                throw new GraphQLError("Forbidden");
              })
          )
          .then((pages) => pages.map((page) => page.id))
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      )
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allBlocksMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: BlockFilter } },
  resolve: (_, { filter: { ids, ...filter } }, { merchant }) =>
    Database("blocks")
      .where(filter)
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .whereIn(
        "page_id",
        Database("pages")
          .select("id")
          .whereIn(
            "design_id",
            Database("designs").select("id").where({ merchant_id: merchant.id })
          )
      )
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { Block, allBlocks, _allBlocksMeta };
