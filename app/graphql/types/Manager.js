import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";

export default new GraphQLObjectType({
  name: "Manager",
  fields: {
    id: { type: GraphQLID },
    company_id: { type: GraphQLID },
    client_id: { type: GraphQLID },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
