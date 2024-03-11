import { GraphQLInputObjectType, GraphQLString } from "graphql";

export default new GraphQLInputObjectType({
  name: "Sort",
  fields: () => ({
    field: { type: GraphQLString },
    order: { type: GraphQLString },
  }),
});
