import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import GraphQLDateTime from "graphql-type-datetime";

export default new GraphQLObjectType({
  name: "Promotion",
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    text: { type: GraphQLString },
    merchant_id: { type: GraphQLID },
    file_id: { type: GraphQLID },
    start_date: { type: GraphQLDateTime },
    end_date: { type: GraphQLDateTime },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
