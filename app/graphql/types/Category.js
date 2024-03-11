import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";

export default new GraphQLObjectType({
  name: "Category",
  fields: {
    id: { type: GraphQLID },
    merchant_id: { type: GraphQLID },
    category_id: { type: GraphQLID },
    name: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
