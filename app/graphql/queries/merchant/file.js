import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database, Config } from "@local/lib/index.js";
import { FILE_CONSTANTS } from "@local/constants/index.js";
import {
  File as FileType,
  FileFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const File = {
  type: FileType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("files")
      .where({ id })
      .first()
      .then((file) => ({
        ...file,
        url: `${Config.assetsUrl}/${file.id}`,
        size: file.size / FILE_CONSTANTS.BYTES_IN_MEGABYTE,
      }))
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allFiles = {
  type: new GraphQLList(FileType),
  args: { ...paginationArgs, filter: { type: FileFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, name, ...filter },
    },
    { merchant }
  ) =>
    Database("files")
      .where({ account_type: "merchants", account_id: merchant.id, ...filter })
      .whereLike("name", `%${name || ""}%`)
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .then((files) =>
        files.map((file) => {
          file.url = `${Config.assetsUrl}/${file.id}`;
          file.size = file.size / FILE_CONSTANTS.BYTES_IN_MEGABYTE;

          return file;
        })
      )
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allFilesMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: FileFilter } },
  resolve: (_, { filter: { ids, name, ...filter } }, { merchant }) =>
    Database("files")
      .where({ account_type: "merchants", account_id: merchant.id, ...filter })
      .whereLike("name", `%${name || ""}%`)
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { File, allFiles, _allFilesMeta };
