import { Database } from "@local/lib/index.js";
import { MerchantPaymentGateway } from "@local/graphql/types/index.js";
import { createMerchantPaymentGatewayValidation } from "@local/graphql/validations/admin/index.js";
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
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    payment_gateway_id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    config: { type: GraphQLJSONObject },
  },
  resolve: (_, args) =>
    createMerchantPaymentGatewayValidation.validate(args).then(() =>
      Database("merchant_payment_gateways")
        .insert({
          ...args,
        })
        .returning("*")
        .then(([merchantPaymentGateway]) => merchantPaymentGateway)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
