import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";

export default new GraphQLObjectType({
  name: "Tag",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    merchant_id: { type: GraphQLID },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
