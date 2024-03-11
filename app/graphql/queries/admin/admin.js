import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Admin as AdminType,
  AdminFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Admin = {
  type: AdminType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("admins")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allAdmins = {
  type: new GraphQLList(AdminType),
  args: { ...paginationArgs, filter: { type: AdminFilter } },
  resolve: (
    _,
    { perPage = 2, page = 0, sortField = "id", sortOrder = "asc", filter },
    { admin }
  ) =>
    Database("admins")
      .where({ id: admin.id, ...filter })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allAdminsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: AdminFilter } },
  resolve: (_, { filter }, { admin }) =>
    Database("admins")
      .where({ id: admin.id, ...filter })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { allAdmins, _allAdminsMeta, Admin };
