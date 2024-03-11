import { Database } from "@local/lib/index.js";
import { MerchantPaymentGateway } from "@local/graphql/types/index.js";
import { createMerchantPaymentGatewayValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: MerchantPaymentGateway,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    payment_gateway_id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    config: { type: GraphQLJSONObject },
  },
  resolve: (_, args, { merchant }) =>
    createMerchantPaymentGatewayValidation
      .validate({ ...args, merchant_id: merchant.id })
      .then(() =>
        Database("merchant_payment_gateways")
          .insert({
            ...args,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([merchantPaymentGateway]) => merchantPaymentGateway)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
