import { Database } from "@local/lib/index.js";
import {
  GraphQLNonNull,
  GraphQLError,
  GraphQLString,
  GraphQLID,
} from "graphql";
import { GasBrand } from "@local/graphql/types/index.js";
import { updateGasBrandValidation } from "@local/graphql/validations/admin/index.js";

export default {
  type: GasBrand,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    logo_file_id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: GraphQLString },
  },
  resolve: (_, args) =>
    updateGasBrandValidation.validate({ ...args }).then(async () => {
      return Database("gas_brands")
        .where({ id: args.id })
        .update({
          name: args.name,
          logo_file_id: args.logo_file_id,
          status: args.status,
        })
        .returning("*")
        .then(([gas_brand]) => gas_brand)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
};
