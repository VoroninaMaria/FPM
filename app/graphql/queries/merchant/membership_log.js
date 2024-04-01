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
  resolve: async (_, { id }, { merchant }) => {
    const all = await Database("clients")
      .where({ merchant_id: merchant.id })
      .select("id");

    const clients_ids = all.map((client) => client.id);

    return Database("membership_log")
      .where({ id })
      .first()
      .modify((queryBuilder) => {
        if (clients_ids?.length) {
          queryBuilder.whereIn("client_id", clients_ids);
        }
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

const allMembershipLogs = {
  type: new GraphQLList(MembershipLogType),
  args: { ...paginationArgs, filter: { type: MembershipLogFilter } },
  resolve: async (
    _,
    {
      perPage = 20,
      page = 0,
      sortField = "merchant_id",
      sortOrder = "asc",
      filter: { ...filter },
    },
    { merchant }
  ) => {
    const all = await Database("clients")
      .where({ merchant_id: merchant.id })
      .select("id");

    const clients_ids = all.map((client) => client.id);

    return Database("membership_log")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (clients_ids?.length) queryBuilder.whereIn("client_id", clients_ids);
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

const _allMembershipLogsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: MembershipLogFilter } },
  resolve: async (_, { filter: { ...filter } }, { merchant }) => {
    const all = await Database("clients")
      .where({ merchant_id: merchant.id })
      .select("id");

    const clients_ids = all.map((client) => client.id);

    return Database("membership_log")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (clients_ids?.length) queryBuilder.whereIn("client_id", clients_ids);
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

export default { MembershipLog, allMembershipLogs, _allMembershipLogsMeta };
