import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Block",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    page_id: { type: GraphQLID },
    props: { type: GraphQLJSONObject },
    blocks: { type: GraphQLInt },
    container_styles: { type: GraphQLJSONObject },
    styles: { type: GraphQLJSONObject },
    position: { type: GraphQLInt },
    updated_at: { type: GraphQLString },
    created_at: { type: GraphQLString },
  },
});
