import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Trunc",
  fields: {
    id: { type: GraphQLID },
    merchant_payment_gateway_id: { type: GraphQLID },
    client_id: { type: GraphQLID },
    status: { type: GraphQLString },
    description: { type: GraphQLString },
    short_description: { type: GraphQLString },
    title: { type: GraphQLString },
    amount: { type: GraphQLInt },
    transactions: { type: new GraphQLList(GraphQLJSONObject) },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
