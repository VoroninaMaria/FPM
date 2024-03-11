import { GraphQLInputObjectType, GraphQLString, GraphQLID } from "graphql";

export default new GraphQLInputObjectType({
  name: "AdminFilter",
  fields: () => ({
    id: { type: GraphQLID },
    login: { type: GraphQLString },
  }),
});
