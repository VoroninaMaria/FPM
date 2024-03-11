import { Database } from "@local/lib/index.js";
import { ClientChange } from "@local/graphql/types/index.js";
import { createClientChangeRequestValidation } from "@local/graphql/validations/client/index.js";
import { CLIENT_CHANGE_STATUSES } from "@local/app/constants/index.js";

import { GraphQLString, GraphQLError } from "graphql";

export default {
  type: ClientChange,
  args: {
    field_name: { type: GraphQLString },
    value: { type: GraphQLString },
  },
  resolve: (_, args, { client }) =>
    createClientChangeRequestValidation
      .validate({ ...args, client_id: client.id }, { strict: true })
      .then(() =>
        Database("client_changes")
          .insert({
            client_id: client.id,
            field_name: args.field_name,
            value: args.value,
            status: CLIENT_CHANGE_STATUSES.pending.name,
          })
          .returning("*")
          .then(([client_change]) => client_change)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};
