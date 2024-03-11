import { Database } from "@local/lib/index.js";
import { File } from "@local/graphql/types/index.js";
import { deleteFileValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: File,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    deleteFileValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("blocks")
          .whereRaw("props->>'file_id' = ?", params.id)
          .first()
          .then((file) => {
            if (file) {
              throw new GraphQLError("file_in_use");
            }

            return Database("promotions")
              .where({ file_id: params.id })
              .first()
              .then((file) => {
                if (file) {
                  throw new GraphQLError("file_in_use");
                }

                return Database("gas_brands")
                  .where({ logo_file_id: params.id })
                  .first()
                  .then((file) => {
                    if (file) {
                      throw new GraphQLError("file_in_use");
                    }

                    return Database("files")
                      .where({
                        id: params.id,
                        account_type: "merchants",
                        account_id: merchant.id,
                      })
                      .del()
                      .returning("*")
                      .then(([file]) => file)
                      .catch(() => {
                        throw new GraphQLError("Forbidden");
                      });
                  });
              });
          })
      ),
};
