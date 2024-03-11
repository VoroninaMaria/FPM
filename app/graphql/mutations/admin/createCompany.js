import { Database } from "@local/lib/index.js";
import { Company } from "@local/graphql/types/index.js";
import { createCompanyValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLNonNull,
  GraphQLError,
  GraphQLString,
  GraphQLID,
} from "graphql";

export default {
  type: Company,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, args) =>
    createCompanyValidation.validate({ ...args }).then(() =>
      Database("companies")
        .insert({
          ...args,
        })
        .returning("*")
        .then(([company]) => company)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
