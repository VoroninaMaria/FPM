import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";
import { Balance } from "@local/graphql/types/index.js";
import { GraphQLError } from "graphql";

const getBalance = {
  type: Balance,
  resolve: async (_, __, { client, merchant }) => {
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

    const clientBalance = await datex
      .getBalance(in_id_clients)
      .then((result) => {
        if (result) {
          const balance = parseFloat(result.balance);

          return { balance };
        } else {
          return { balance: 0 };
        }
      });

    await datex.close();

    return clientBalance;
  },
};

export default getBalance;
