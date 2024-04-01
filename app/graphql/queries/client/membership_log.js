import { GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { MembershipLog as MembershipLogType } from "@local/graphql/types/index.js";

const allMembershipLogs = {
  type: new GraphQLList(MembershipLogType),
  resolve: (_, __, { client }) =>
    Database("membership_log")
      .where({ client_id: client.id })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { allMembershipLogs };
