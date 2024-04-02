import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
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
    membership_id: { type: GraphQLID },
    membership: { type: new GraphQLList(GraphQLJSONObject) },
    category_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
    unconfirmed_changes: { type: new GraphQLList(GraphQLJSONObject) },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
