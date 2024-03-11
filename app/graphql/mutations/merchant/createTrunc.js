import PaymentGateways from "@local/connectors/payment_gateways/index.js";
import { Database } from "@local/lib/index.js";
import { Trunc } from "@local/graphql/types/index.js";
import { createTruncValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLInt, GraphQLNonNull, GraphQLID, GraphQLString } from "graphql";
import { GraphQLError } from "graphql";

import {
  PAYMENT_GATEWAY_STATUSES,
  MERCHANT_PAYMENT_GATEWAY_STATUSES,
} from "@local/app/constants/index.js";

const { /* Monobank, LiqPay, NovaPay, */ Pumb } = PaymentGateways;

export default {
  type: Trunc,
  args: {
    merchant_payment_gateway_id: { type: new GraphQLNonNull(GraphQLID) },
    client_id: { type: new GraphQLNonNull(GraphQLID) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: (_, args, { merchant }) =>
    createTruncValidation
      .validate({ ...args, merchant_id: merchant.id })
      .then(async () => {
        const mpg = await Database("merchant_payment_gateways")
          .where({
            id: args.merchant_payment_gateway_id,
            merchant_id: merchant.id,
            default: true,
            status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
          })
          .first()
          .then(async (mpg) => {
            if (!mpg) return;

            const { name } = await Database("payment_gateways")
              .where({
                id: mpg.payment_gateway_id,
                status: PAYMENT_GATEWAY_STATUSES.active.name,
              })
              .first();

            return { ...mpg, paymentName: name };
          })
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });

        const [trunc] = await Database("payment_truncs")
          .insert({
            amount: args.amount,
            description: args.description,
            short_description: args.description,
            title: "test",
            merchant_payment_gateway_id: mpg.id,
            client_id: args.client_id,
            status: "pending",
          })
          .returning("*")
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });

        switch (mpg.paymentName) {
          case "Pumb": {
            const pumbInstance = new Pumb({
              ...mpg.config,
            });

            const transaction = await pumbInstance
              .trunc({
                amount: args.amount * 100,
                external_id: trunc.id,
                description: args.description,
                short_description: args.description,
                client: {
                  source: "external",
                  id: args.client_id,
                },
                config_id: mpg.config.config_id,
                title: "test",
              })
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });

            const response = await pumbInstance.status({
              id: transaction.id,
            });

            return Database("payment_truncs")
              .where({ id: trunc.id })
              .update({
                status: response.status,
                transactions: JSON.stringify([
                  { ...trunc.transactions, ...response, trunc: transaction },
                ]),
              })
              .returning("*")
              .then(([updatedTrunc]) => updatedTrunc)
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });
          }
        }
      }),
};
