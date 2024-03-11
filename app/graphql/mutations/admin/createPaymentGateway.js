import { Database } from "@local/lib/index.js";
import { AdminPaymentGateway } from "@local/graphql/types/index.js";
import { createPaymentGatewayValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLError, GraphQLString } from "graphql";

export default {
  type: AdminPaymentGateway,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },

  resolve: (_, args) =>
    createPaymentGatewayValidation.validate(args, { strict: true }).then(() =>
      Database("payment_gateways")
        .insert({
          ...args,
        })
        .returning("*")
        .then(([payment_gateway]) => payment_gateway)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
