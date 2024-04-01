import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { changeMembershipStatusValidation } from "@local/graphql/validations/client/index.js";
import { GraphQLError, GraphQLString } from "graphql";

export default {
  type: Membership,
  args: {
    status: { type: GraphQLString },
  },
  resolve: async (_, args, { client }) => {
    const membership = await Database("memberships")
      .where({
        id: client.membership_id,
      })
      .select("id", "term")
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

    const term = membership[0].term;
    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + term * 24 * 60 * 60 * 1000
    );

    await Database("clients")
      .where({ id: client.id })
      .update({ membership_id: null });

    return changeMembershipStatusValidation
      .validate({ id: client.id })
      .then(async () =>
        Database("membership_log")
          .insert({
            client_id: client.id,
            membership_id: membership[0].id,
            status: args.status,
            start_date: Database.fn.now(),
            end_date: futureDate,
          })
          .returning("*")
          .then(([membership]) => membership)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      );
  },
};
