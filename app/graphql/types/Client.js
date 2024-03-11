import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Client",
  fields: {
    id: { type: GraphQLID },
    merchant_id: { type: GraphQLID },
    status: { type: GraphQLString },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    category_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
    unconfirmed_changes: { type: new GraphQLList(GraphQLJSONObject) },
    company_id: { type: GraphQLID },
    id_clients: { type: GraphQLInt },
    entity: { type: GraphQLInt },
    city: { type: GraphQLString },
    address: { type: GraphQLString },
    external_id: { type: GraphQLID },
    balance: { type: GraphQLFloat },
    transactions: { type: new GraphQLList(GraphQLJSONObject) },
    payment_transactions: { type: new GraphQLList(GraphQLJSONObject) },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
