import { Database } from "@local/lib/index.js";
import { Location } from "@local/graphql/types/index.js";
import { createLocationValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";

export default {
  type: Location,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    address: { type: new GraphQLNonNull(GraphQLString) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    createLocationValidation.validate({ ...params }).then(() =>
      Database("locations")
        .insert({
          ...params,
        })
        .returning("*")
        .then(([location]) => location)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
