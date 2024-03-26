import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
} from "graphql";
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
    status: { type: GraphQLString },
    term: { type: GraphQLInt },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  }),
});
