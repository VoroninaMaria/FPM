import { Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { changeMembershipStatusValidation } from "@local/graphql/validations/client/index.js";
import { GraphQLError } from "graphql";

export default {
  type: Client,
  resolve: async (_, __, { client }) => {
    const terms = await Database("memberships")
      .where({
        id: client.membership_id,
      })
      .select("term");

    const term = terms[0].term;
    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + term * 24 * 60 * 60 * 1000
    );

    return changeMembershipStatusValidation
      .validate({ id: client.id })
      .then(async () =>
        Database("memberships")
          .where({
            id: client.membership_id,
            status: "inactive",
          })
          .update({
            status: "active",
            start_date: Database.fn.now(),
            end_date: futureDate,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([client]) => client)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      );
  },
};
