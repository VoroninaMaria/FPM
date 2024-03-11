import { QrCard } from "@local/graphql/types/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";
import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";

export default {
  type: QrCard,
  args: {
    old_pin: { type: new GraphQLNonNull(GraphQLString) },
    new_pin: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_, { old_pin, new_pin }, { client, merchant }) => {
    if (!old_pin) {
      throw new GraphQLError("Forbidden");
    }
    if (!new_pin) {
      throw new GraphQLError("Forbidden");
    }
    if (!client) {
      throw new GraphQLError("Forbidden");
    }
    if (!merchant) {
      throw new GraphQLError("Forbidden");
    }
    const datexBrand = await Database("brands")
      .where({ name: "Datex" })
      .first();
    const dtxMerchantBrand = await Database("brand_merchants")
      .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
      .first();
    const datex = new Datex(dtxMerchantBrand.config);

    const { id_clients } = await datex.clientIdByExternalId(client.id);

    const qrCard = await datex.getClientQRCard(id_clients);

    if (old_pin !== qrCard.pin1) {
      throw new GraphQLError("old_pin_invalid");
    }

    if (old_pin === qrCard.pin1 && id_clients === qrCard.card_owner) {
      const [updatedPinCode] = await datex.updateQRCardPin(qrCard.id, new_pin);

      return updatedPinCode;
    }
  },
};
