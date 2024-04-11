import { GraphQLList, GraphQLError } from "graphql";
import { Database, Config } from "@local/lib/index.js";
import { Membership as MembershipType } from "@local/graphql/types/index.js";
import { GraphQLID, GraphQLNonNull } from "graphql/index.js";

const Membership = {
  type: MembershipType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { client }) =>
    Database("memberships")
      .where({ id, merchant_id: client.merchant_id })
      .first()
      .then(async (membership) => {
        membership.abilities = await Database("abilities")
          .select([
            "id",
            "name",
            "description",
            "description1",
            "description2",
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

        const file = await Database("files")
          .where({ id: membership.file_id })
          .first();

        membership.address = address[0].address;
        membership.url = `${Config.assetsUrl}/${file.id}`;

        return membership;
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
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
              "description1",
              "description2",
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

          const file = await Database("files")
            .where({ id: membership.file_id })
            .first();

          membership.address = address[0].address;
          membership.url = `${Config.assetsUrl}/${file.id}`;

          return membership;
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { Membership, allMemberships };
