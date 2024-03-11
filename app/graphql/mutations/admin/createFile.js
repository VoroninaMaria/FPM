import { Database } from "@local/lib/index.js";
import { File } from "@local/graphql/types/index.js";
import { FILE_CONSTANTS } from "@local/constants/index.js";
import { createFileValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLError,
} from "graphql";

export default {
  type: File,
  args: {
    merchant_id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    data: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, params, { admin }) => {
    const name = params.name;
    const account_type = params.merchant_id ? "merchants" : "admins";
    const account_id = params.merchant_id ?? admin.id;

    return createFileValidation
      .validate({ data: params.data, name, account_type, account_id })
      .then(async () => {
        const mimetype = params.data.split(";")[0].split(":")[1];

        if (!FILE_CONSTANTS.ALLOWED_FILETYPES.includes(mimetype)) {
          throw new GraphQLError("Forbidden");
        }

        if (account_type === "merchants") {
          const filesizes = await Database("files").select("size").where({
            account_type,
            account_id,
          });

          const spaceTakenMb =
            filesizes.reduce((sum, file) => sum + file.size, 0) /
            FILE_CONSTANTS.BYTES_IN_MEGABYTE;

          const { storage_capacity } = await Database("merchants")
            .select("storage_capacity")
            .where({ id: account_id })
            .first();

          if (spaceTakenMb >= storage_capacity) {
            throw new GraphQLError("no_free_space");
          }
        }

        const dataString = params.data.split(",")[1];
        const size =
          dataString.length * (3 / 4) -
          (dataString.includes("==") ? 2 : dataString.includes("=") ? 1 : 0);

        if (
          size >
          FILE_CONSTANTS.MAX_FILESIZE_MB * FILE_CONSTANTS.BYTES_IN_MEGABYTE
        ) {
          throw new GraphQLError("oversize");
        }

        const data = Buffer.from(dataString, "base64");

        return Database("files")
          .insert({
            mimetype,
            name,
            account_id,
            account_type,
            size,
            data,
          })
          .onConflict(["name", "account_type", "account_id"])
          .merge()
          .returning("*")
          .then(([file]) => file)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          });
      });
  },
};
