import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Page as PageType,
  PageFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Page = {
  type: PageType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("pages")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allPages = {
  type: new GraphQLList(PageType),
  args: { ...paginationArgs, filter: { type: PageFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids = [], ...filter },
    },
    { merchant }
  ) =>
    Database("pages")
      .whereIn(
        "design_id",
        Database("designs").select("id").where({ merchant_id: merchant.id })
      )
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

const _allPagesMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: PageFilter } },
  resolve: (_, { filter: { ids = [], ...filter } }, { merchant }) =>
    Database("pages")
      .whereIn(
        "design_id",
        Database("designs").select("id").where({ merchant_id: merchant.id })
      )
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

export default { Page, allPages, _allPagesMeta };
