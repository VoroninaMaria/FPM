import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Client as ClientType,
  ClientFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";
import { CLIENT_CHANGE_STATUSES } from "@local/constants/index.js";

const Client = {
  type: ClientType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { merchant }) =>
    Database("clients")
      .where({ "clients.id": id, merchant_id: merchant.id })
      .select([
        Database.raw('"clients".*'),
        Database.raw(
          "(select array_agg(tag_id) from client_tags where client_tags.client_id = clients.id) as tag_ids"
        ),
      ])
      .first()
      .then(({ tag_ids, ...client }) => ({
        tag_ids: tag_ids || [],
        ...client,
      }))
      .then(async (client) => {
        client.unconfirmed_changes = await Database("client_changes")
          .select(["field_name", "value", "status", "id"])
          .where({
            client_id: client.id,
            status: CLIENT_CHANGE_STATUSES.pending.name,
          });

        return client;
      })
      .catch(() => {
        throw new GraphQLError("Forrbiden");
      }),
};

const allClients = {
  type: new GraphQLList(ClientType),
  args: { ...paginationArgs, filter: { type: ClientFilter } },
  resolve: (
    _,
    {
      perPage = 2,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { phone, ...filter },
    },
    { merchant }
  ) =>
    Database("clients")
      .select([
        Database.raw('"clients".*'),
        Database.raw(
          "(select array_agg(tag_id) from client_tags where client_tags.client_id = clients.id) as tag_ids"
        ),
      ])
      .where({ merchant_id: merchant.id, ...filter })
      .whereLike("phone", `%${phone || ""}%`)
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .then((clients) => {
        return clients.map(async ({ tag_ids, ...client }) => {
          client.unconfirmed_changes = await Database("client_changes")
            .select(["field_name", "value", "status", "id"])
            .where({
              client_id: client.id,
              status: CLIENT_CHANGE_STATUSES.pending.name,
            });

          return {
            tag_ids: tag_ids || [],
            ...client,
          };
        });
      })
      .catch(() => {
        throw new GraphQLError("Forrbiden");
      }),
};

const _allClientsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: ClientFilter } },
  resolve: (_, { filter: { phone, ...filter } }, { merchant }) =>
    Database("clients")
      .where({ merchant_id: merchant.id, ...filter })
      .whereLike("phone", `%${phone || ""}%`)
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forrbiden");
      }),
};

export default { allClients, _allClientsMeta, Client };
