import { GraphQLList, GraphQLError } from "graphql";
import { Database, Config } from "@local/lib/index.js";
import { Membership as MembershipType } from "@local/graphql/types/index.js";

const Membership = {
  type: MembershipType,
  resolve: async (_, __, { client }) => {
    let res = null;

    if (client.membership_id !== null) {
      res = await Database("memberships")
        .where({ id: client.membership_id })
        .select("*");
      res[0].abilities = await Database("abilities")
        .select([
          "id",
          "name",
          "description",
          "regular_price",
          "discount_price",
        ])
        .where({
          membership_id: client.membership_id,
        })
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      const address = await Database("locations")
        .where({
          merchant_id: client.merchant_id,
        })
        .select("address")
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      res[0].address = address[0].address;

      res[0].status = "inactive";
      const file = await Database("files")
        .where({ id: res[0].file_id })
        .first();

      res[0].url = `${Config.assetsUrl}/${file.id}`;
      return res[0];
    } else {
      const ActiveMembership = await Database("membership_log")
        .where({ client_id: client.id, status: "active" })
        .returning("*");

      if (ActiveMembership[0]?.end_date) {
        const currentDate = new Date();

        if (ActiveMembership[0].end_date < currentDate) {
          await Database("membership_log")
            .where({
              id: ActiveMembership[0].id,
            })
            .update({
              status: "disabled",
            });

          return res;
        } else {
          res = await Database("memberships")
            .where({ id: ActiveMembership[0].membership_id })
            .select("*");

          res[0].abilities = await Database("abilities")
            .select([
              "id",
              "name",
              "description",
              "regular_price",
              "discount_price",
            ])
            .where({
              membership_id: ActiveMembership[0].membership_id,
            })
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });

          const address = await Database("locations")
            .where({
              merchant_id: client.merchant_id,
            })
            .select("address")
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });

          res[0].address = address[0].address;

          res[0].end_date = ActiveMembership[0].end_date;
          res[0].start_date = ActiveMembership[0].start_date;
          res[0].status = "active";

          const file = await Database("files")
            .where({ id: res[0].file_id })
            .first();

          res[0].url = `${Config.assetsUrl}/${file.id}`;

          return res[0];
        }
      }
    }
    return res;
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
