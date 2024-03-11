import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";
import { QrCard } from "@local/graphql/types/index.js";
import { GraphQLString, GraphQLError, GraphQLNonNull } from "graphql";

const jurQRCard = {
  type: QrCard,
  args: {
    code_edroup: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_, { code_edroup, phone }, { client, merchant }) => {
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

    if (client.phone !== phone) {
      throw new GraphQLError("Forbidden");
    }

    const jurCard = await datex.getClientJurQRCard(code_edroup, phone);

    const jurClientBalance = await datex
      .getBalance(jurCard.card_owner)
      .then((result) => {
        if (result) {
          const balance = parseFloat(result.balance);

          return { balance };
        } else {
          return { balance: 0 };
        }
      });

    await datex.close();

    return { balance: jurClientBalance.balance, ...jurCard };
  },
};

export default jurQRCard;
