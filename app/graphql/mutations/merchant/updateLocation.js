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
    name: { type: new GraphQLNonNull(GraphQLString) },
    address: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { merchant }) =>
    updateLocationValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("locations")
          .where({
            id: params.id,
            merchant_id: merchant.id,
          })
          .update({
            name: params.name,
            address: params.address,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([location]) => location)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
