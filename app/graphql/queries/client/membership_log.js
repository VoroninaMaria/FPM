import { GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { MembershipLog as MembershipLogType } from "@local/graphql/types/index.js";

const allMembershipLogs = {
  type: new GraphQLList(MembershipLogType),
  resolve: async (_, __, { client }) => {
    try {
      const membershipLogs = await Database("membership_log")
        .where({ client_id: client.id })
        .select();

      const logsWithNames = await Promise.all(
        membershipLogs.map(async (log) => {
          const membership = await Database("memberships")
            .where({ id: log.membership_id })
            .select("name")
            .first();

          return { ...log, name: membership.name };
        })
      );

      return logsWithNames;
    } catch (error) {
      console.error(error);
      throw new GraphQLError("Forbidden");
    }
  },
};

export default { allMembershipLogs };
