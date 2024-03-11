import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";
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

    if (merchant.plugins.datex) {
      const datexBrand = await Database("brands")
        .where({ name: "Datex" })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      const dtxMerchantBrand = await Database("brand_merchants")
        .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      const datex = new Datex(dtxMerchantBrand.config);

      const datexClient = await datex.getClient(client.phone);

      await datex.close();

      return {
        id_clients: datexClient.id_clients,
        ...datexClient,
        entity: datexClient.id_form_property,
        ...clientInfo,
      };
    }

    return clientInfo;
  },
};

export default self;
