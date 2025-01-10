import { Database } from "@local/lib/index.js";
import { Location } from "@local/graphql/types/index.js";
import { updateLocationValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";

export default {
  type: Location,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    file_id: { type: new GraphQLNonNull(GraphQLID) },
    address: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params) =>
    updateLocationValidation.validate({ ...params }).then(() =>
      Database("locations")
        .where({
          id: params.id,
        })
        .update({
          name: params.name,
          address: params.address,
          merchant_id: params.merchant_id,
          file_id: params.file_id,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([location]) => location)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
