import { Config, Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { GraphQLError } from "graphql";
import {
  CLIENT_CHANGE_STATUSES,
  CLIENT_STATUSES,
} from "@local/constants/index.js";

const self = {
  type: Client,
  resolve: async (_, __, { client, merchant }) => {
    if (!client) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant) {
      throw new GraphQLError("Forbidden");
    }

    const clientInfo = await Database("clients")
      .where({ id: client.id, status: CLIENT_STATUSES.confirmed.name })
      .first()
      .then(async (default_client) => {
        default_client.unconfirmed_changes = await Database("client_changes")
          .select(["field_name", "value", "id"])
          .where({
            client_id: default_client.id,
            status: CLIENT_CHANGE_STATUSES.pending.name,
          })
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });

        return default_client;
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

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
        }
      }
    }

    return { membership: res, ...clientInfo };
  },
};

export default self;
