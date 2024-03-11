import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Brand",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    default_config: { type: GraphQLJSONObject },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
