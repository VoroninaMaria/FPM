import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Design",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    merchant_id: { type: GraphQLID },
    styles: { type: GraphQLJSONObject },
    default_page_id: { type: GraphQLID },
    error_page_id: { type: GraphQLID },
    loader_page_id: { type: GraphQLID },
    authenticated_page_id: { type: GraphQLID },
    updated_at: { type: GraphQLString },
    created_at: { type: GraphQLString },
  },
});
