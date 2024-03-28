import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt,
} from "graphql";
import GraphQLDateTime from "graphql-type-datetime";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Membership",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    price: { type: GraphQLFloat },
    term: { type: GraphQLInt },
    merchant_id: { type: GraphQLID },
    location_id: { type: GraphQLID },
    file_id: { type: GraphQLID },
    url: { type: GraphQLString },
    start_date: { type: GraphQLDateTime },
    end_date: { type: GraphQLDateTime },
    abilities: { type: new GraphQLList(GraphQLJSONObject) },
    address: { type: GraphQLString },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
