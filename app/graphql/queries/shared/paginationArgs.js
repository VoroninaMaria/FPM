import { GraphQLInt, GraphQLString } from "graphql";

const paginationArgs = {
  perPage: { type: GraphQLInt },
  page: { type: GraphQLInt },
  sortOrder: { type: GraphQLString },
  sortField: { type: GraphQLString },
};

export default paginationArgs;
