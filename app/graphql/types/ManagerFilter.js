import { GraphQLInputObjectType, GraphQLID, GraphQLList } from "graphql";

export default new GraphQLInputObjectType({
  name: "ManagerFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    company_id: { type: GraphQLID },
    client_id: { type: GraphQLID },
  }),
});
