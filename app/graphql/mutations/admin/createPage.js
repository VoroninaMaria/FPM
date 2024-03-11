import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { Page } from "@local/graphql/types/index.js";
import { createPageValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLID } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Page,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    styles: { type: new GraphQLNonNull(GraphQLJSONObject) },
    design_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    createPageValidation.validate(params).then(() =>
      Database("pages")
        .insert(params)
        .returning("*")
        .then(([page]) => page)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
