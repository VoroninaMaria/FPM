import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
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
  resolve: (_, { id }) =>
    Database("clients")
      .select([
        Database.raw('"clients".*'),
        Database.raw(
          "(select array_agg(tag_id) from client_tags where client_tags.client_id = clients.id) as tag_ids"
        ),
      ])
      .where({ id })
      .first()
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
        throw new GraphQLError("Forbidden");
      }),
};

const allClients = {
  type: new GraphQLList(ClientType),
  args: { ...paginationArgs, filter: { type: ClientFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("clients")
      .select([
        Database.raw('"clients".*'),
        Database.raw(
          "(select array_agg(tag_id) from client_tags where client_tags.client_id = clients.id) as tag_ids"
        ),
      ])
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
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
        throw new GraphQLError("Forbidden");
      }),
};

const _allClientsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: ClientFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("clients")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { allClients, _allClientsMeta, Client };
