import { Database } from "@local/lib/index.js";
import { Location } from "@local/graphql/types/index.js";
import { createLocationValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";

export default {
  type: Location,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    address: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { merchant }) =>
    createLocationValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("locations")
          .insert({
            ...params,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([location]) => location)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
