import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from "graphql";
import { GraphQLFloat } from "graphql/index.js";
import GraphQLDateTime from "graphql-type-datetime";

export default new GraphQLInputObjectType({
  name: "MembershipFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    price: { type: GraphQLFloat },
    merchant_id: { type: GraphQLID },
    location_id: { type: GraphQLID },
    start_date: { type: GraphQLDateTime },
    end_date: { type: GraphQLDateTime },
    address: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  }),
});
