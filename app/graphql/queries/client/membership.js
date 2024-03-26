import { GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { Membership as MembershipType } from "@local/graphql/types/index.js";

const Membership = {
  type: MembershipType,
  resolve: async (_, __, { client }) => {
    const membershipRes = await Database("memberships")
      .select("*")
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
      .then(async (membership) => {
        const address = await Database("locations")
          .where({
            merchant_id: membership.merchant_id,
          })
          .select("address")
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });

        membership.address = address[0].address;
        return membership;
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

    return membershipRes;
  },
};

const allMemberships = {
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

          const address = await Database("locations")
            .where({
              merchant_id: membership.merchant_id,
            })
            .select("address")
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });

          membership.address = address[0].address;

          return membership;
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { Membership, allMemberships };
