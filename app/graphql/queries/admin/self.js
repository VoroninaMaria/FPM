import { Database } from "@local/lib/index.js";
import { Admin } from "@local/graphql/types/index.js";
import { GraphQLError } from "graphql";

const self = {
  type: Admin,
  resolve: (_, __, context) =>
    Database("admins")
      .where({ id: context.admin.id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default self;
