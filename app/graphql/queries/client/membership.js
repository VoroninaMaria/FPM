import { GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { Membership as MembershipType } from "@local/graphql/types/index.js";
import { GraphQLID, GraphQLNonNull } from "graphql/index.js";

const ActiveMembership = {
  type: MembershipType,
  resolve: async (_, __, { client }) => {
    const membershipRes = await "memberships"
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

const Membership = {
  type: MembershipType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: async (_, { id }, { client }) => {
    const membershipRes = await Database("memberships")
      .where({
        id,
        merchant_id: client.merchant_id,
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

          return membership;
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { ActiveMembership, allMemberships, Membership };
