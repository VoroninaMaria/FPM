import { Database } from "@local/lib/index.js";
import { Location } from "@local/graphql/types/index.js";
import { deleteLocationValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Location,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    deleteLocationValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("locations")
          .where({
            ...params,
          })
          .del()
          .returning("*")
          .then(([location]) => location)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
