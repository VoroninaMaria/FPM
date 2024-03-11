import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Promotion as PromotionType,
  ClientPromotionFilter as PromotionFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const dateNow = new Date().toISOString();

const Promotion = {
  type: PromotionType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { merchant }) =>
    Database("promotions")
      .where({ id, merchant_id: merchant.id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allPromotions = {
  type: new GraphQLList(PromotionType),
  args: { ...paginationArgs, filter: { type: PromotionFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, unreadOnly, ...filter },
    },
    { merchant, client }
  ) =>
    Database("promotions")
      .where({ ...filter, merchant_id: merchant.id })
      .andWhere("start_date", "<=", dateNow)
      .andWhere("end_date", ">=", dateNow)
      .modify((queryBuilder) => {
        if (unreadOnly) {
          queryBuilder.whereNotIn(
            "id",
            Database("client_promotions")
              .select("promotion_id")
              .where({ client_id: client.id })
          );
        }
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

const _allPromotionsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: PromotionFilter } },
  resolve: (
    _,
    { filter: { ids, unreadOnly, ...filter } },
    { merchant, client }
  ) =>
    Database("promotions")
      .where({ ...filter, merchant_id: merchant.id })
      .andWhere("start_date", "<=", dateNow)
      .andWhere("end_date", ">=", dateNow)
      .modify((queryBuilder) => {
        if (unreadOnly) {
          queryBuilder.whereNotIn(
            "id",
            Database("client_promotions")
              .select("promotion_id")
              .where({ client_id: client.id })
          );
        }
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

export default { Promotion, allPromotions, _allPromotionsMeta };
