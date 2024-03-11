import { Database } from "@local/lib/index.js";
import { Block } from "@local/graphql/types/index.js";
import { deleteBlockValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Block,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    deleteBlockValidation.validate(params).then(() =>
      Database("blocks")
        .where({
          id: params.id,
        })
        .del()
        .returning("*")
        .then(([Block]) => Block)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};
