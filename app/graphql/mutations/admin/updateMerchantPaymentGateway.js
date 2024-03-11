import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import { MerchantPaymentGateway } from "@local/graphql/types/index.js";
import { updateMerchantPaymentGatewayValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLJSONObject } from "graphql-type-json";
import { GraphQLBoolean } from "graphql";

export default {
  type: MerchantPaymentGateway,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    config: { type: GraphQLJSONObject },
    default: { type: GraphQLBoolean },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    updateMerchantPaymentGatewayValidation.validate(args).then(() =>
      Database("merchant_payment_gateways")
        .where({
          id: args.id,
          merchant_id: args.merchant_id,
        })
        .update({
          name: args.name,
          status: args.status,
          config: args.config,
          default: args.default,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([merchantPaymentGateway]) => merchantPaymentGateway)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
