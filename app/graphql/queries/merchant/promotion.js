import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Promotion as PromotionType,
  PromotionFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Promotion = {
  type: PromotionType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { merchant }) =>
    Database("promotions")
      .where({ id, merchant_id: merchant.id })
      .first()
      .then(({ start_date, end_date, ...promotion }) => ({
        start_date,
        end_date,
        ...promotion,
      }))
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
      filter: { ids, ...filter },
    },
    { merchant }
  ) =>
    Database("promotions")
      .where({ ...filter, merchant_id: merchant.id })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .then((promotions) =>
        promotions.map(({ start_date, end_date, ...promotion }) => ({
          start_date,
          end_date,
          ...promotion,
        }))
      )
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allPromotionsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: PromotionFilter } },
  resolve: (_, { filter: { ids, ...filter } }, { merchant }) =>
    Database("promotions")
      .where({ ...filter, merchant_id: merchant.id })
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

export default { Promotion, allPromotions, _allPromotionsMeta };
