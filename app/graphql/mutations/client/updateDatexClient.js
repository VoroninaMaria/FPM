import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";
import { DatexClient } from "@local/graphql/types/index.js";
import { updateDatexClientValidation } from "@local/graphql/validations/client/index.js";
import { GraphQLString, GraphQLError } from "graphql";

export default {
  type: DatexClient,
  args: {
    fn_clients: { type: GraphQLString },
    phones: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  resolve: (_, args, { client, merchant }) =>
    updateDatexClientValidation
      .validate({ ...args, merchant_id: merchant.id }, { strict: true })
      .then(async () => {
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

        const { id_clients } = await datex.clientIdByExternalId(client.id);

        const [dtxClient] = await datex.updateClient({
          id_clients: id_clients,
          fn_clients: args.fn_clients,
          phones: args.phones,
          email: args.email,
        });

        await datex.close();

        return { id: dtxClient.id_clients, ...dtxClient };
      }),
};
