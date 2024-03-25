import { GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { Membership as MembershipType } from "@local/graphql/types/index.js";

const membership = {
  type: MembershipType,
  resolve: (_, __, { client }) => {
    const membershipRes = Database("memberships")
      .where({
        id: client.membership_id,
      })
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
          })
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });
        return membership;
      })

      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

    return membershipRes;
  },
};

const memberships = {
  type: new GraphQLList(MembershipType),
  resolve: (_, __, { client }) =>
    Database("memberships")
      .where({ merchant_id: client.merchant_id })
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

export { membership, memberships };
