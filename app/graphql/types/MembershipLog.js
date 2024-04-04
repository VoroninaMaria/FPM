import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import GraphQLDateTime from "graphql-type-datetime";

export default new GraphQLObjectType({
  name: "MembershipLog",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    client_id: { type: GraphQLID },
    membership_id: { type: GraphQLID },
    start_date: { type: GraphQLDateTime },
    end_date: { type: GraphQLDateTime },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});
