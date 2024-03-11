import { GraphQLID, GraphQLList, GraphQLError, GraphQLNonNull } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Company as CompanyType,
  CompanyFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Company = {
  type: CompanyType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("companies")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allCompanies = {
  type: new GraphQLList(CompanyType),
  args: { ...paginationArgs, filter: { type: CompanyFilter } },
  resolve: (
    _,
    {
      perPage = 20,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("companies")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allCompaniesMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: CompanyFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("companies")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { Company, allCompanies, _allCompaniesMeta };
