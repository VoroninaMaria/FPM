import { Database } from "@local/lib/index.js";
import { MembershipLog } from "@local/graphql/types/index.js";
import { updateMembershipLogValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import GraphQLDateTime from "graphql-type-datetime";

export default {
  type: MembershipLog,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    start_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    updateMembershipLogValidation.validate({ ...args }).then(() =>
      Database("membership_log")
        .where({
          id: args.id,
        })
        .update({
          start_date: args.start_date,
          end_date: args.end_date,
          status: args.status,
        })
        .returning("*")
        .then(([membership_log]) => membership_log)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
