import PaymentGateways from "@local/connectors/payment_gateways/index.js";
import { Database } from "@local/lib/index.js";
import { Datex } from "@local/app/connectors/brands/index.js";
import { ClientTrunc } from "@local/graphql/types/index.js";
import { createTruncValidation } from "@local/graphql/validations/client/index.js";
import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQLError } from "graphql";

import { MERCHANT_PAYMENT_GATEWAY_STATUSES } from "@local/app/constants/index.js";

const { /* Monobank, LiqPay, NovaPay, */ Pumb } = PaymentGateways;

export default {
  type: ClientTrunc,
  args: {
    title: { type: GraphQLString },
    description: { type: new GraphQLNonNull(GraphQLString) },
    short_description: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: (_, args, { merchant, client }) =>
    createTruncValidation
      .validate({ ...args, merchant_id: merchant.id, client_id: client.id })
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
          .first()
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });

        const dtxMerchantBrand = await Database("brand_merchants")
          .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
          .first()
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });

        const datex = new Datex(dtxMerchantBrand.config);

        const datexClient = await datex.getClient(client.phone);

        const mpg = await Database("merchant_payment_gateways")
          .where({
            merchant_id: merchant.id,
            default: true,
            status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
          })
          .first()
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });

        const pumbInstance = new Pumb({
          ...mpg.config,
        });

        await datex.close();

        return Database("payment_truncs")
          .insert({
            amount: args.amount,
            description: args.description,
            short_description: args.short_description,
            title: args.title,
            merchant_payment_gateway_id: mpg.id,
            client_id: datexClient.external_id,
            status: "pending",
          })
          .returning("*")
          .then(([trunc]) =>
            pumbInstance
              .trunc({
                amount: args.amount * 100,
                external_id: trunc.id,
                description: args.description,
                short_description: args.short_description,
                client: {
                  source: "external",
                  id: trunc.client_id,
                },
                config_id: mpg.config.config_id,
              })
              .then(async (transaction) => {
                const response = await pumbInstance.status({
                  id: transaction.id,
                });

                return Database("payment_truncs")
                  .where({ id: trunc.id })
                  .update({
                    status: response.status,
                    transactions: JSON.stringify([
                      {
                        ...trunc.transactions,
                        ...response,
                        trunc: transaction,
                      },
                    ]),
                  })
                  .returning("*")
                  .then((response) => {
                    return { response: transaction, ...response };
                  })
                  .catch(() => {
                    throw new GraphQLError("Forbidden");
                  });
              })
              .catch(() => {
                throw new GraphQLError("Forbidden");
              })
          )
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });
      }),
};
