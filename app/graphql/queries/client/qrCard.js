import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";
import { QrCard } from "@local/graphql/types/index.js";
import { GraphQLError } from "graphql";

const qrCard = {
  type: QrCard,
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

    const card = await datex.getClientQRCard(in_id_clients);

    await datex.close();

    return card;
  },
};

export default qrCard;
