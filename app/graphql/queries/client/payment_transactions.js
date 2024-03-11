import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";
import {
  DatexPaymentTransaction,
  DatexPaymentTransactionFilter,
} from "@local/graphql/types/index.js";
import { GraphQLError, GraphQLList } from "graphql";

const allPaymentTransactions = {
  type: new GraphQLList(DatexPaymentTransaction),
  args: { filter: { type: DatexPaymentTransactionFilter } },
  resolve: async (_, { filter }, { client, merchant }) => {
    if (!client) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant.plugins.datex) {
      throw new GraphQLError("Forbidden");
    }

    const datexBrand = await Database("brands")
      .where({ name: "Datex" })
      .first();
    const dtxMerchantBrand = await Database("brand_merchants")
      .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
      .first();
    const datex = new Datex(dtxMerchantBrand.config);
    const { id_clients: in_id_clients } = await datex.clientIdByExternalId(
      client.id
    );

    const paymentTransactions = await datex.getClientTopUpTransactions(
      filter,
      in_id_clients
    );

    await datex.close();

    return paymentTransactions.map((pt) => {
      return { client_fn: `${client.first_name} ${client.last_name}`, ...pt };
    });
  },
};

export { allPaymentTransactions };
