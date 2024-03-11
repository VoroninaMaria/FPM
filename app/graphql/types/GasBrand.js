import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";

export default new GraphQLObjectType({
  name: "GasBrand",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    logo_file_id: { type: GraphQLID },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
