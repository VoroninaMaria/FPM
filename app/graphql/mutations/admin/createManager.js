import { Database } from "@local/lib/index.js";
import { Manager } from "@local/graphql/types/index.js";
import { createManagerValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLError, GraphQLID } from "graphql";

export default {
  type: Manager,
  args: {
    client_id: { type: new GraphQLNonNull(GraphQLID) },
    company_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, args) =>
    createManagerValidation.validate({ ...args }).then(async () => {
      await Database("clients")
        .where({ id: args.client_id })
        .first()
        .update({ company_id: args.company_id })
        .returning("*")
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      return Database("managers")
        .insert({
          ...args,
        })
        .returning("*")
        .then(([manager]) => manager)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
};
