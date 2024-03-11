import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
  GraphQLString,
} from "graphql";
import { AdminPaymentGateway } from "@local/graphql/types/index.js";
import { updatePaymentGatewayValidation } from "@local/graphql/validations/admin/index.js";

export default {
  type: AdminPaymentGateway,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    updatePaymentGatewayValidation.validate({ ...args }).then(() =>
      Database("payment_gateways")
        .where({
          id: args.id,
        })
        .update({
          name: args.name,
          status: args.status,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([payment_gateway]) => payment_gateway)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
