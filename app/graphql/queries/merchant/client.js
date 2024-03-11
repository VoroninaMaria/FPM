import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database, Logger } from "@local/lib/index.js";
import { Datex } from "@local/app/connectors/brands/index.js";
import {
  Client as ClientType,
  ClientFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";
import { CLIENT_CHANGE_STATUSES } from "@local/constants/index.js";

const Client = {
  type: ClientType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    filter: { type: ClientFilter },
  },
  resolve: (_, { id, filter }, { merchant }) => {
    if (!id) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant) {
      throw new GraphQLError("Forbidden");
    }

    return Database("clients")
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
        if (merchant.plugins.datex) {
          const datexBrand = await Database("brands")
            .where({ name: "Datex" })
            .first();
          const dtxMerchantBrand = await Database("brand_merchants")
            .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
            .first();
          const datex = new Datex(dtxMerchantBrand.config);

          const dtxClient = await datex.getClient(client.phone);

          const { balance: clientBalance } = await datex
            .getBalance(dtxClient.id_clients)
            .then((result) => {
              if (result) {
                const balance = parseFloat(result.balance);

                return { balance };
              } else {
                return { balance: 0 };
              }
            });

          client.transactions = await datex.getClientTransactions(
            filter,
            dtxClient.id_clients
          );

          const paymentTransactions = await datex.getClientTopUpTransactions(
            filter,
            dtxClient.id_clients
          );

          client.payment_transactions = paymentTransactions.map((pt) => {
            if (!pt.note) {
              return {
                client_fn: `${client.first_name} ${client.last_name}`,
                payment_note: "поповнення",
                ...pt,
              };
            }
            return {
              client_fn: `${client.first_name} ${client.last_name}`,
              payment_note: pt.note,
              ...pt,
            };
          });

          client.unconfirmed_changes = await Database("client_changes")
            .select(["field_name", "value", "status", "id"])
            .where({
              client_id: client.id,
              status: CLIENT_CHANGE_STATUSES.pending.name,
            });

          await datex.close();

          return {
            ...dtxClient,
            balance: clientBalance,
            entity: dtxClient.id_form_property,
            ...client,
          };
        }
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
      });
  },
};

const allClients = {
  type: new GraphQLList(ClientType),
  args: { ...paginationArgs, filter: { type: ClientFilter } },
  resolve: async (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "desc",
      filter: { phone, ids, ...filter },
    },
    { merchant }
  ) => {
    if (merchant.plugins.datex === true) {
      const datexBrand = await Database("brands")
        .where({ name: "Datex" })
        .first()
        .catch((error) => {
          Logger.error(error);
          throw new GraphQLError("Forrbiden");
        });

      const dtxMerchantBrand = await Database("brand_merchants")
        .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
        .first()
        .catch((error) => {
          Logger.error(error);
          throw new GraphQLError("Forrbiden");
        });

      const datex = new Datex(dtxMerchantBrand.config);

      const dtxClients = await datex.getClients({
        filter: { ...filter },
      });

      await datex.close();

      return Database("clients")
        .where({
          merchant_id: merchant.id,
          ...filter,
        })
        .whereLike("phone", `%${phone || ""}%`)
        .modify((queryBuilder) => {
          if (dtxClients?.length) {
            return queryBuilder.whereIn(
              "phone",
              dtxClients.map((dtxClient) => dtxClient.phones)
            );
          }
          if (ids?.length) {
            return queryBuilder.whereIn("id", ids);
          }
        })
        .limit(perPage)
        .offset(page * perPage)
        .orderBy(sortField, sortOrder)
        .then(async (clients) => {
          const datexEnabledClients = clients.map(async (client) => {
            client.unconfirmed_changes = await Database("client_changes")
              .select(["field_name", "value", "status", "id"])
              .where({
                client_id: client.id,
                status: CLIENT_CHANGE_STATUSES.pending.name,
              })
              .catch((error) => {
                Logger.error(error);
                throw new GraphQLError("Forrbiden");
              });

            const dtx_client = dtxClients.find(
              (dtxClient) => client.phone === dtxClient.phones
            );

            return {
              ...dtx_client,
              entity: dtx_client.id_form_property,
              ...client,
            };
          });

          return datexEnabledClients;
        });
    }

    const nonDatexClients = await Database("clients")
      .select([
        Database.raw('"clients".*'),
        Database.raw(
          "(select array_agg(tag_id) from client_tags where client_tags.client_id = clients.id) as tag_ids"
        ),
      ])
      .where({ merchant_id: merchant.id, ...filter })
      .whereLike("phone", `%${phone || ""}%`)
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
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
        throw new GraphQLError("Forrbiden");
      });

    return nonDatexClients;
  },
};

const _allClientsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: ClientFilter } },
  resolve: async (_, { filter: { phone, ids, ...filter } }, { merchant }) => {
    if (merchant.plugins.datex === true) {
      const datexBrand = await Database("brands")
        .where({ name: "Datex" })
        .first();
      const dtxMerchantBrand = await Database("brand_merchants")
        .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
        .first();
      const datex = new Datex(dtxMerchantBrand.config);
      const dtxClients = await datex.getClients({
        filter: { ...filter },
      });

      const totalClients = await Database("clients")
        .where({
          merchant_id: merchant.id,
          ...filter,
        })
        .whereLike("phone", `%${phone || ""}%`)
        .modify((queryBuilder) => {
          if (dtxClients?.length) {
            return queryBuilder.whereIn(
              "phone",
              dtxClients.map((dtxClient) => dtxClient.phones)
            );
          }
        })
        .count()
        .first()
        .catch((error) => {
          Logger.error(error);
          throw new GraphQLError("Forrbiden");
        });

      await datex.close();

      return totalClients;
    }

    return Database("clients")
      .where({ merchant_id: merchant.id, ...filter })
      .whereLike("phone", `%${phone || ""}%`)
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .count()
      .first()
      .catch((error) => {
        Logger.error(error);
        throw new GraphQLError("Forrbiden");
      });
  },
};

export default { allClients, _allClientsMeta, Client };
