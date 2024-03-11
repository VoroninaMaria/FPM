import { Database } from "@local/lib/index.js";
import { GasBrand } from "@local/graphql/types/index.js";
import { createGasBrandValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLNonNull,
  GraphQLError,
  GraphQLString,
  GraphQLID,
} from "graphql";

export default {
  type: GasBrand,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    logo_file_id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: GraphQLString },
  },
  resolve: (_, args) =>
    createGasBrandValidation.validate({ ...args }).then(async () => {
      return Database("gas_brands")
        .insert({
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
