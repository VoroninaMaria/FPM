import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  MembershipLog as MembershipLogType,
  MembershipLogFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const MembershipLog = {
  type: MembershipLogType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("membership_log")
      .where({ id })
      .first()
      .then(async (membership) => {
        membership.abilities = await Database("abilities")
          .select([
            "id",
            "name",
            "description",
            "regular_price",
            "discount_price",
          ])
          .where({
            membership_id: membership.id,
          });

        return membership;
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allMembershipLogs = {
  type: new GraphQLList(MembershipLogType),
  args: { ...paginationArgs, filter: { type: MembershipLogFilter } },
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
    Database("membership_log")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .then((memberships) => {
        return memberships.map(async (membership) => {
          membership.abilities = await Database("abilities")
            .select([
              "id",
              "name",
              "description",
              "regular_price",
              "discount_price",
            ])
            .where({
              membership_id: membership.id,
            });

          return membership;
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allMembershipLogsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: MembershipLogFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("membership_log")
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

export default { MembershipLog, allMembershipLogs, _allMembershipLogsMeta };
