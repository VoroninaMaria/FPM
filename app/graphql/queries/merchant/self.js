import { Database } from "@local/lib/index.js";
import { Merchant } from "@local/graphql/types/index.js";
import { GraphQLError } from "graphql";

const self = {
  type: Merchant,
  resolve: (_, __, { merchant }) =>
    Database("merchants")
      .where({ id: merchant.id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default self;
