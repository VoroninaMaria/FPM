import { Database } from "@local/lib/index.js";
import { File } from "@local/graphql/types/index.js";
import { deleteFileValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: File,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params) =>
    deleteFileValidation.validate({ ...params }).then(() => {
      return Database("files")
        .where({
          id: params.id,
        })
        .del()
        .returning("*")
        .then(([file]) => file)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
};
