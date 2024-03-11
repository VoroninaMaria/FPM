import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "DatexClient",
  fields: {
    id: { type: GraphQLInt },
    id_clients: { type: GraphQLInt },
    fn_clients: { type: GraphQLString },
    sn_clients: { type: GraphQLString },
    city: { type: GraphQLString },
    address: { type: GraphQLString },
    email: { type: GraphQLString },
    phones: { type: GraphQLString },
    external_id: { type: GraphQLID },
    transactions: { type: new GraphQLList(GraphQLJSONObject) },
  },
});
