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

    return clientInfo;
  },
};

export default self;
