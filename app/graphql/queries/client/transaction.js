import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";
import {
  DatexTransaction,
  DatexTransactionFilter,
} from "@local/graphql/types/index.js";
import { GraphQLError, GraphQLList } from "graphql";

const allTransactions = {
  type: new GraphQLList(DatexTransaction),
  args: { filter: { type: DatexTransactionFilter } },
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

    const transactions = await datex.getClientTransactions(
      filter,
      in_id_clients
    );

    await datex.close();

    return transactions;
  },
};

export { allTransactions };
