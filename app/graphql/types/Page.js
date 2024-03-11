import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Page",
  fields: {
    id: { type: GraphQLID },
    design_id: { type: GraphQLID },
    name: { type: GraphQLString },
    styles: { type: GraphQLJSONObject },
    updated_at: { type: GraphQLString },
    created_at: { type: GraphQLString },
  },
});
